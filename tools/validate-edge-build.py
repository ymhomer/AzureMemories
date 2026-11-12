from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];site=R/'_site';plan=json.loads((R/'edge-plan.json').read_text());report=json.loads((site/'EDGE_VOICE_REPORT.json').read_text());s=(site/'edge-voice-manifest.js').read_text();manifest,_=json.JSONDecoder().raw_decode(s.removeprefix('globalThis.AzureEdgeVoices='));expected={x['key']:(u['characterId'],x['textSha256']) for u in plan['utterances'] for x in u['keys']}
assert report['complete'] and manifest['complete'] and not report['errors']
assert set(manifest['entries'])==set(expected) and len(expected)==plan['spokenLineCount']
files={}
for key,e in manifest['entries'].items():
 assert (e['characterId'],e['textSha256'])==expected[key]
 p=(site/e['file']).resolve();assert p.is_relative_to((site/'assets/voice/edge').resolve()) and p.suffix=='.mp3'
 if p not in files:
  b=p.read_bytes();assert len(b)>1000 and (b.startswith(b'ID3') or b[0]==255);files[p]=len(b)
 if 'end' in e:assert 0<=e['start']<e['end']<files[p]/6000+1
summary={'complete':True,'verifiedSpokenLines':len(expected),'verifiedAudioFiles':len(files),'verifiedAudioBytes':sum(files.values()),'characterProfiles':len(plan['cast']),'baseVoices':len({x['voice'] for x in plan['cast'].values()}),'sourceHash':plan['sourceHash'],'deviceSpeechFallback':False,'skippedCardsAndNonverbal':len(plan['skipped'])};(site/'EDGE_BUILD_VALIDATION.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
sums={str(p.relative_to(site)):hashlib.sha256(p.read_bytes()).hexdigest() for p in site.rglob('*') if p.is_file() and p.name!='SHA256SUMS.json'};(site/'SHA256SUMS.json').write_text(json.dumps(sums,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=False))
