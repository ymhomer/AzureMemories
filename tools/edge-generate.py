"""Generate cached Edge-TTS audio sprites and a source-keyed playback manifest.
Only SentenceBoundary is used: WordBoundary produced no audio in the live pilot.
"""
from pathlib import Path
import argparse,asyncio,hashlib,json,re,shutil,unicodedata,random
import edge_tts

def normalized(text):return ''.join(c for c in unicodedata.normalize('NFKC',text) if c.isalnum())
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
def chunks(plan):
 result=[]
 for cid in plan['cast']:
  batch=[];size=0
  for u in [u for u in plan['utterances'] if u['characterId']==cid]:
   if batch and size+len(u['text'])>500:result.append((cid,batch));batch=[];size=0
   batch.append(u);size+=len(u['text'])+2
  if batch:result.append((cid,batch))
 return result

def align(batch,marks):
 targets=[normalized(u['text']) for u in batch];joined=''.join(targets);spans=[];cursor=0
 for t in targets:spans.append((cursor,cursor+len(t)));cursor+=len(t)
 found=[[] for _ in batch];cursor=0
 for m in marks:
  word=normalized(m['text'])
  if not word:continue
  at=joined.find(word,cursor)
  if at!=cursor:raise ValueError('Boundary text does not exactly align with source')
  end=at+len(word);owners=[i for i,(a,b) in enumerate(spans) if at>=a and end<=b]
  if len(owners)!=1:raise ValueError('Boundary crosses a dialogue line')
  found[owners[0]].append(m);cursor=end
 if cursor!=len(joined) or any(not x for x in found):raise ValueError('Incomplete boundary coverage')
 clips=[]
 for i,events in enumerate(found):
  start=max(0,events[0]['offset']/1e7-.055);tail=.32 if re.search(r'[.…]{2,}[」』”’）)]*$',batch[i]['text']) else .18;end=max((m['offset']+m['duration'])/1e7 for m in events)+tail
  if i+1<len(found):end=min(end,found[i+1][0]['offset']/1e7-.025)
  if end<=start:raise ValueError('Invalid clip duration')
  original=batch[i]['text'];positions=[]
  for index,char in enumerate(original):
   positions.extend([index]*len(normalized(char)))
  cues=[];cursor=0
  if ''.join(normalized(c) for c in original)==targets[i]:
   for n,m in enumerate(events):
    count=len(normalized(m['text']));next_cursor=cursor+count
    first=0 if n==0 else positions[cursor]
    last=positions[next_cursor] if next_cursor<len(positions) else len(original)
    cue_start=max(start,m['offset']/1e7);cue_end=min(end,(m['offset']+m['duration'])/1e7)
    if cue_end>cue_start:cues.append({'start':round(cue_start,4),'end':round(cue_end,4),'textStart':first,'textEnd':last,'normStart':cursor,'normEnd':next_cursor})
    cursor=next_cursor
  clips.append({'start':round(start,4),'end':round(end,4),'cues':cues})
 return clips

async def main(args):
 plan=json.loads(args.plan.read_text());site=args.site;cache=args.cache;cache.mkdir(parents=True,exist_ok=True);audio_dir=site/'assets/voice/edge';audio_dir.mkdir(parents=True,exist_ok=True)
 work=chunks(plan);selected=work
 if args.characters:selected=[x for x in work if x[0] in args.characters.split(',')]
 if args.pilot:
  seen=set();selected=[x for x in selected if not (x[0] in seen or seen.add(x[0]))]
 if args.limit:selected=selected[:args.limit]
 sem=asyncio.Semaphore(args.concurrency);entries={};errors=[];stats={'cached':0,'generated':0,'singleFallback':0};completed=0

 async def synth(text,profile,identity):
  key=digest({'edge':'7.3.1','boundary':'SentenceBoundary','text':text,'profile':profile,'identity':identity})[:32];audio=cache/(key+'.mp3');meta=cache/(key+'.json')
  if audio.exists() and meta.exists():
   try:
    m=json.loads(meta.read_text())
    if hashlib.sha256(audio.read_bytes()).hexdigest()==m['audioSha256'] and audio.stat().st_size>1000:stats['cached']+=1;return key,audio,m['boundaries']
   except (ValueError,KeyError,OSError):pass
  for attempt in range(4):
   try:
    buf=bytearray();marks=[]
    async def receive():
     stream=edge_tts.Communicate(text,profile['voice'],rate=profile['rate'],pitch=profile['pitch'],boundary='SentenceBoundary',connect_timeout=15,receive_timeout=50)
     async for event in stream.stream():
      if event['type']=='audio':buf.extend(event['data'])
      elif event['type']=='SentenceBoundary':marks.append(event)
    await asyncio.wait_for(receive(),100)
    if len(buf)<1000 or not marks:raise ValueError('Empty audio or missing timing metadata')
    audio.write_bytes(buf);meta.write_text(json.dumps({'audioSha256':hashlib.sha256(buf).hexdigest(),'boundaries':marks},ensure_ascii=False)+'\n');stats['generated']+=1;return key,audio,marks
   except Exception as exc:
    if attempt==3:raise RuntimeError(type(exc).__name__) from None
    await asyncio.sleep(2*(2**attempt)+random.random())
  raise RuntimeError('Unreachable')

 def register(u,key,audio,clip):
  name=key+'.mp3';target=audio_dir/name
  if not target.exists():shutil.copyfile(audio,target)
  for item in u['keys']:entries[item['key']]={'characterId':u['characterId'],'file':'assets/voice/edge/'+name,'textSha256':item['textSha256'],**clip}

 async def process(cid,batch):
  nonlocal completed
  async with sem:
   profile=plan['cast'][cid];text='\n'.join(u['text'] if re.search(r'[。.!?！？…][」』”’）)]*$',u['text']) else u['text']+'。' for u in batch)
   try:
    key,audio,marks=await synth(text,profile,[u['id'] for u in batch])
    try:
     clips=align(batch,marks)
     for u,clip in zip(batch,clips):register(u,key,audio,clip)
    except ValueError:
     # A normalization ambiguity never guesses a cut point: generate that line separately.
     for u in batch:
      skey,sound,smarks=await synth(u['text'],profile,u['id']);register(u,skey,sound,{});stats['singleFallback']+=1
   except Exception as exc:errors.append({'characterId':cid,'utteranceIds':[u['id'] for u in batch],'errorType':str(exc)})
   completed+=1
   if completed%10==0 or completed==len(selected):print(json.dumps({'batches':completed,'total':len(selected),'voicedLines':len(entries),'errors':len(errors),**stats}),flush=True)
   await asyncio.sleep(.35)
 await asyncio.gather(*(process(cid,b) for cid,b in selected))
 complete=not errors and len(entries)==plan['spokenLineCount']
 manifest={'edition':5,'engine':'Edge TTS 7.3.1','complete':complete,'sourceHash':plan['sourceHash'],'cast':plan['cast'],'voicedLines':len(entries),'expectedVoicedLines':plan['spokenLineCount'],'entries':entries}
 (site/'edge-voice-manifest.js').write_text('globalThis.AzureEdgeVoices='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';globalThis.AzureRemakeManifest.voices=AzureEdgeVoices.entries;\n')
 report={'complete':complete,'voicedLines':len(entries),'expectedVoicedLines':plan['spokenLineCount'],'totalDialogueKeys':plan['totalDialogueKeys'],'skippedCardsAndNonverbal':len(plan['skipped']),'uniqueUtterances':len(plan['utterances']),'audioFiles':len(list(audio_dir.glob('*.mp3'))),'audioBytes':sum(p.stat().st_size for p in audio_dir.glob('*.mp3')),'batches':len(selected),'plannedBatches':len(work),'stats':stats,'errors':errors,'notes':plan['notes']}
 (site/'EDGE_VOICE_REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 version=site/'VERSION.json'
 if version.exists():
  d=json.loads(version.read_text());d.update(voiceEngine='Edge TTS',voicedLines=len(entries),voiceComplete=complete,formalVoiceFiles=report['audioFiles'],voiceCharacters=len(plan['cast']),baseVoiceCount=len({v['voice'] for v in plan['cast'].values()}));version.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 sums={str(p.relative_to(site)):hashlib.sha256(p.read_bytes()).hexdigest() for p in site.rglob('*') if p.is_file() and p.name!='SHA256SUMS.json'};(site/'SHA256SUMS.json').write_text(json.dumps(sums,indent=2)+'\n')
 print(json.dumps(report,ensure_ascii=False),flush=True)
 if errors or (not args.limit and not args.characters and not args.pilot and not complete):raise SystemExit(2)

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--plan',type=Path,required=True);p.add_argument('--site',type=Path,required=True);p.add_argument('--cache',type=Path,required=True);p.add_argument('--limit',type=int,default=0);p.add_argument('--characters',default='');p.add_argument('--pilot',action='store_true');p.add_argument('--concurrency',type=int,default=2);asyncio.run(main(p.parse_args()))
