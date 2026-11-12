'use strict';
((root)=>{
 const clean=s=>String(s||'').normalize('NFKC').trim();
 const ids={'以翔':'yixiang','玉米粒':'yixiang','星奈':'xingnai','星紗':'xingsha','Sawa':'sawa','綾音':'ayane','劉蠻':'liuman','護士':'nurse','相館老闆':'photo-owner','遊客男':'tourist-m','遊客女':'tourist-f'};
 const female=new Set(['xingnai','xingsha','sawa','ayane','nurse','tourist-f']);
 function character(w){const n=clean(w.name);if(ids[n])return ids[n];if(n==='???'){const sceneSpeaker={7:'yixiang',11:'xingnai',25:'ayane',53:'xingnai',94:'xingnai',112:'xingnai',193:'xingsha',213:'sawa',238:'xingnai'}[w.scene];if(sceneSpeaker)return sceneSpeaker;if(w.scene===30&&w.offset===2174)return 'xingnai';if(w.sprite_resource?.startsWith('1'))return 'xingnai';if(w.sprite_resource?.startsWith('2'))return 'xingsha';if(w.sprite_resource?.startsWith('3'))return 'sawa';if(w.sprite_resource?.startsWith('4'))return 'liuman';if(w.scene===7&&w.offset===983)return 'yixiang';return null;}if(!n&&!w.has_name)return 'yixiang';return n?'extra:'+n:null;}
 function key(w){return w.scene+':'+w.offset;}
 class Player{
  constructor(options={}){this.Audio=options.Audio??root.Audio;this.manifest=options.manifest??{};this.resolve=options.resolve??(x=>x);this.onState=options.onState??(()=>{});this.onError=options.onError??(()=>{});this.mode='off';this.volume=.8;this.token=0;this.pending=false;this.audio=null;this.timer=null;this.waiting=null;this.text='';this.warned=new Set();}
  warn(message){if(this.warned.has(message))return;this.warned.add(message);this.onError(message);}
  stop(){this.token++;clearInterval(this.timer);this.timer=null;const a=this.audio;this.audio=null;if(a){a.onended=null;a.onerror=null;a.onplaying=null;a.onloadedmetadata=null;a.ontimeupdate=null;a.pause();a.removeAttribute?.('src');a.load?.();}this.pending=false;this.onState(false);}
  setMode(mode){this.stop();this.mode=mode==='recorded'?'recorded':'off';}
  async play(w,text){this.stop();const token=this.token;this.waiting=w;this.text=text;if(this.mode!=='recorded'||w?.kind!=='dialogue'||!String(text).trim())return false;const id=character(w),entry=this.manifest[key(w)];if(!entry||!id||entry.characterId!==id)return false;const hash=await root.crypto?.subtle?.digest?.('SHA-256',new TextEncoder().encode(text));if(token!==this.token)return false;if(hash&&entry.textSha256&&Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('')!==entry.textSha256)return false;
   const finish=()=>{if(token!==this.token)return;clearInterval(this.timer);this.timer=null;this.pending=false;this.onState(false);};
   try{const a=new this.Audio(this.resolve(entry.file));this.audio=a;a.preload='auto';a.volume=Math.min(1,Math.max(0,this.volume));const start=Number(entry.start)||0,end=Number(entry.end);const cut=Number.isFinite(end)&&end>start;const check=()=>{if(token!==this.token)return;if(cut&&a.currentTime>=end){a.pause();finish();}};
    a.onloadedmetadata=()=>{if(token!==this.token)return;if(start>0)a.currentTime=start;};a.ontimeupdate=check;a.onplaying=()=>{if(token!==this.token){a.pause();return;}if(cut){clearInterval(this.timer);this.timer=setInterval(check,30);}};a.onended=finish;a.onerror=()=>{if(token===this.token)this.warn('這句角色語音暫時無法載入，可繼續閱讀。');finish();};this.pending=true;this.onState(true);await a.play();if(token!==this.token){a.pause();return false;}return true;
   }catch(e){if(token===this.token){this.warn(e?.name==='NotAllowedError'?'點選選單的「重播本句」即可開啟角色語音。':'角色語音無法播放，可繼續閱讀。');finish();}return false;}
  }
  replay(){return this.waiting?this.play(this.waiting,this.text):Promise.resolve(false);}
 }
 const api={Player,character,key};root.AzureVoice=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
