'use strict';
((root)=>{
 const clean=s=>String(s||'').normalize('NFKC').trim();
 const ids={'以翔':'yixiang','星奈':'xingnai','星紗':'xingsha','Sawa':'sawa','綾音':'ayane','劉蠻':'liuman','護士':'nurse','相館老闆':'photo-owner','遊客男':'tourist-m','遊客女':'tourist-f'};
 const female=new Set(['xingnai','xingsha','sawa','ayane','nurse','tourist-f']);
 function character(w){const n=clean(w.name);if(ids[n])return ids[n];if(n==='???'){if(w.sprite_resource?.startsWith('1'))return 'xingnai';if(w.sprite_resource?.startsWith('2'))return 'xingsha';if(w.sprite_resource?.startsWith('3'))return 'sawa';if(w.sprite_resource?.startsWith('4'))return 'liuman';if(w.scene===7&&w.offset===983)return 'yixiang';return null;}if(!n&&!w.has_name)return 'yixiang';return n?'extra:'+n:null;}
 function key(w){return w.scene+':'+w.offset;}
 function taiwanVoices(list){return list.filter(v=>/^zh[-_]TW$/i.test(v.lang)).sort((a,b)=>(a.voiceURI||a.name).localeCompare(b.voiceURI||b.name));}
 class Player{
  constructor(options={}){this.synth=options.synth??root.speechSynthesis;this.Audio=options.Audio??root.Audio;this.manifest=options.manifest??{};this.resolve=options.resolve??(x=>x);this.onState=options.onState??(()=>{});this.onError=options.onError??(()=>{});this.mode='off';this.volume=.8;this.token=0;this.pending=false;this.audio=null;this.waiting=null;this.text='';this.voices=[];this.warned=new Set();this.refresh();this.voicesHandler=()=>this.refresh();this.synth?.addEventListener?.('voiceschanged',this.voicesHandler);}
  warn(message){if(this.warned.has(message))return;this.warned.add(message);this.onError(message);}
  refresh(){this.voices=taiwanVoices(this.synth?.getVoices?.()||[]);return this.voices;}
  stop(){this.token++;const a=this.audio;this.audio=null;if(a){a.onended=null;a.onerror=null;a.onplaying=null;a.pause();a.removeAttribute?.('src');a.load?.();}this.synth?.cancel?.();this.pending=false;this.onState(false);}
  setMode(mode){this.stop();this.mode=['off','recorded','device'].includes(mode)?mode:'off';}
  async play(w,text){this.stop();const token=this.token;this.waiting=w;this.text=text;if(this.mode==='off'||w?.kind!=='dialogue'||!String(text).trim())return false;const id=character(w),entry=this.manifest[key(w)];if(this.mode==='recorded'){if(!entry||!id||entry.characterId!==id)return false;const hash=await root.crypto?.subtle?.digest?.('SHA-256',new TextEncoder().encode(text));if(token!==this.token)return false;if(hash&&entry.textSha256&&Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('')!==entry.textSha256)return false;}
   const finish=()=>{if(token!==this.token)return;this.pending=false;this.onState(false);};
   if(this.mode==='device'){if(!id||!this.synth||!root.SpeechSynthesisUtterance||!this.refresh().length){this.warn('此裝置沒有台灣華語音色；可關閉朗讀，文字仍可正常遊玩。');return false;}const cast=['yixiang','xingnai','sawa','xingsha','ayane','liuman','nurse','photo-owner','tourist-m','tourist-f'];const index=Math.max(0,cast.indexOf(id)),u=new root.SpeechSynthesisUtterance(text);u.voice=this.voices[index%this.voices.length];u.lang='zh-TW';u.volume=this.volume;u.rate=.98;u.pitch=female.has(id)?1.08:.96;u.onend=finish;u.onerror=e=>{if(token===this.token&&e.error!=='canceled'&&e.error!=='interrupted')this.warn('裝置朗讀暫時不可用。');finish();};this.pending=true;this.onState(true);this.synth.speak(u);return true;}
   try{const a=new this.Audio(this.resolve(entry.file));this.audio=a;a.volume=this.volume;a.onended=finish;a.onerror=()=>{if(token===this.token)this.warn('這句語音載入失敗，可繼續閱讀。');finish();};this.pending=true;this.onState(true);await a.play();if(token!==this.token){a.pause();return false;}return true;}catch(e){if(token===this.token){this.warn('語音無法播放，可繼續閱讀。');finish();}return false;}
  }
  replay(){return this.waiting?this.play(this.waiting,this.text):Promise.resolve(false);}
 }
 const api={Player,character,key,taiwanVoices};root.AzureVoice=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
