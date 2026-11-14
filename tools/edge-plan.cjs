'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');const root=path.resolve(__dirname,'..'),S=require(path.join(root,'prosody.js')),P=require(path.join(root,'presentation.js')),V=require(path.join(root,'voice.js'));require(path.join(root,'data.js'));for(const n of fs.readdirSync(root).filter(n=>/^data-events-\d+\.js$/.test(n)).sort())require(path.join(root,n));const D=globalThis.AzureData;
const cast={
 yixiang:{label:'以翔',voice:'zh-CN-YunxiNeural',rate:'+0%',pitch:'+0Hz'},
 xingnai:{label:'星奈',voice:'zh-CN-XiaoyiNeural',rate:'+1%',pitch:'+0Hz'},
 sawa:{label:'Sawa',voice:'zh-CN-XiaoxiaoNeural',rate:'+5%',pitch:'-3Hz'},
 xingsha:{label:'星紗',voice:'zh-TW-HsiaoYuNeural',rate:'-5%',pitch:'+0Hz'},
 ayane:{label:'綾音',voice:'zh-TW-HsiaoChenNeural',rate:'-2%',pitch:'-3Hz'},
 liuman:{label:'劉蠻',voice:'zh-CN-YunjianNeural',rate:'+3%',pitch:'-6Hz'},
 'photo-owner':{label:'相館老闆',voice:'zh-CN-YunyangNeural',rate:'-7%',pitch:'-6Hz'},
 nurse:{label:'護士',voice:'zh-TW-HsiaoChenNeural',rate:'-2%',pitch:'+0Hz'},
 'tourist-m':{label:'遊客男',voice:'zh-CN-YunxiaNeural',rate:'+5%',pitch:'+0Hz'},
 'tourist-f':{label:'遊客女',voice:'zh-CN-XiaoyiNeural',rate:'+5%',pitch:'+8Hz'},
 'extra:小販婆婆':{label:'小販婆婆',voice:'zh-TW-HsiaoYuNeural',rate:'-10%',pitch:'-12Hz'},
 'extra:攤販':{label:'攤販',voice:'zh-CN-YunyangNeural',rate:'+4%',pitch:'+5Hz'},
 'extra:衝浪學生':{label:'衝浪學生',voice:'zh-CN-YunxiaNeural',rate:'+8%',pitch:'+5Hz'},
 'extra:商家':{label:'商家',voice:'zh-CN-XiaoxiaoNeural',rate:'+0%',pitch:'-8Hz'},
 'extra:店家':{label:'店家',voice:'zh-CN-YunyangNeural',rate:'+0%',pitch:'-4Hz'},
 'extra:遊客':{label:'遊客',voice:'zh-CN-XiaoyiNeural',rate:'+0%',pitch:'-4Hz'}
};
const spoken=[],skipped=[],unknown=[],byKey=new Map(),dedup=new Map();
function walk(x,scene){if(Array.isArray(x)){for(const y of x)walk(y,scene);return}if(!x||typeof x!=='object')return;if(x.kind==='dialogue'){const w={...x,scene},text=P.text(w),key=V.key(w);if(byKey.has(key))throw Error('Duplicate source key '+key);byKey.set(key,true);if(P.mode(w)==='chapter'||!/[\p{L}\p{N}]/u.test(text)){skipped.push({key,reason:P.mode(w)==='chapter'?'章節或地點字卡':'空白或無語音文字'});return;}const characterId=V.character(w);if(!characterId||!cast[characterId]){unknown.push({key,name:w.name,text});return;}const hash=crypto.createHash('sha256').update(text).digest('hex'),said=S.speech(text),identity=characterId+'\0'+said;let u=dedup.get(identity);if(!u){u={id:crypto.createHash('sha256').update(identity).digest('hex').slice(0,24),characterId,text:said,keys:[]};dedup.set(identity,u);}u.keys.push({key,textSha256:hash});spoken.push({key,characterId,textSha256:hash});return;}for(const v of Object.values(x))if(v&&typeof v==='object')walk(v,scene)}
for(const e of D.events)walk(e.actors,e.id);if(unknown.length)throw Error('Uncast lines: '+JSON.stringify(unknown));const plan={edition:5,speechPolicy:'semantic-v5',sourceHash:D.sourceHash,cast,utterances:[...dedup.values()],spokenLineCount:spoken.length,skipped,totalDialogueKeys:byKey.size,notes:['主要角色使用不同基礎華語聲線；部分配角共用基礎聲線並使用固定語速／音高。','只有合成成功且時間戳對齊的語音才會發布；不回退到裝置朗讀。','Edge TTS 不提供完整情緒或真人尖叫表演。']};const out=process.argv[2]||path.join(root,'edge-plan.json');fs.writeFileSync(out,JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({dialogues:byKey.size,spoken:spoken.length,uniqueUtterances:dedup.size,skipped:skipped.length,characters:Object.keys(cast).length}));
