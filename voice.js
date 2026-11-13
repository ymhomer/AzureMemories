'use strict';
((root)=>{
 const clean=s=>String(s||'').normalize('NFKC').trim();
 const ids={'以翔':'yixiang','玉米粒':'yixiang','星奈':'xingnai','星紗':'xingsha','Sawa':'sawa','綾音':'ayane','劉蠻':'liuman','護士':'nurse','相館老闆':'photo-owner','遊客男':'tourist-m','遊客女':'tourist-f'};
 const female=new Set(['xingnai','xingsha','sawa','ayane','nurse','tourist-f']);
 function character(w){const n=clean(w.name);if(ids[n])return ids[n];if(n==='???'){const sceneSpeaker={7:'yixiang',11:'xingnai',25:'ayane',53:'xingnai',94:'xingnai',112:'xingnai',193:'xingsha',213:'sawa',238:'xingnai'}[w.scene];if(sceneSpeaker)return sceneSpeaker;if(w.scene===30&&w.offset===2174)return 'xingnai';if(w.sprite_resource?.startsWith('1'))return 'xingnai';if(w.sprite_resource?.startsWith('2'))return 'xingsha';if(w.sprite_resource?.startsWith('3'))return 'sawa';if(w.sprite_resource?.startsWith('4'))return 'liuman';if(w.scene===7&&w.offset===983)return 'yixiang';return null;}if(!n&&!w.has_name)return 'yixiang';return n?'extra:'+n:null;}
 function key(w){return w.scene+':'+w.offset;}
 class Player{
  constructor(options={}){this.Audio=options.Audio??root.Audio;this.manifest=options.manifest??{};this.resolve=options.resolve??(x=>x);this.onState=options.onState??(()=>{});this.onError=options.onError??(()=>{});this.mode='off';this.volume=.8;this.rate=1;this.token=0;this.pending=false;this.audio=null;this.timer=null;this.timeout=null;this.waiting=null;this.text='';this.entry=null;this.status='idle';this.pool=new Map();this.warned=new Set();}
  get volume(){return this._volume??.8;}
  set volume(value){this._volume=Math.max(0,Math.min(1,Number(value)||0));if(this.audio)this.audio.volume=this._volume;}
  warn(message){if(this.warned.has(message))return;this.warned.add(message);this.onError(message);}
  statusTo(status){this.status=status;this.onState(status==='playing'||status==='loading');}
  stop(){this.token++;clearInterval(this.timer);clearTimeout(this.timeout);this.timer=null;this.timeout=null;const a=this.audio;this.audio=null;if(a){for(const key of ['onended','onerror','onplaying','onloadedmetadata','ontimeupdate'])a[key]=null;a.pause();}this.pending=false;this.statusTo('idle');}
  setMode(mode){this.stop();this.mode=mode==='recorded'?'recorded':'off';}
  setRate(rate){this.rate=Math.max(.8,Math.min(1.3,Number(rate)||1));if(this.audio)this.audio.playbackRate=this.rate;}
  entryFor(w){const e=this.manifest[key(w||{})];return w?.kind==='dialogue'&&e?.characterId===character(w)?e:null;}
  obtain(file){if(!this.pool.has(file)){const a=new this.Audio(this.resolve(file));a.preload='auto';this.pool.set(file,a);while(this.pool.size>2){const first=[...this.pool.keys()].find(k=>this.pool.get(k)!==this.audio&&k!==file&&k!==this.entry?.file);if(!first)break;const old=this.pool.get(first);old.pause();old.removeAttribute?.('src');old.load?.();this.pool.delete(first);}}return this.pool.get(file);}
  preload(w){const e=this.mode==='recorded'&&this.entryFor(w);if(e)this.obtain(e.file);}
  get progress(){const a=this.audio,start=Number(this.entry?.start)||0,end=Number(this.entry?.end),duration=Number.isFinite(end)?end-start:Number(a?.duration)||0,time=Number(a?.currentTime)||start;return{key:this.waiting?key(this.waiting):null,status:this.status,entry:this.entry,time,duration,ratio:duration?Math.max(0,Math.min(1,(time-start)/duration)):0};}
  pause(){if(!this.pending)return false;this.audio?.pause();clearTimeout(this.timeout);this.statusTo('paused');return true;}
  async resume(){if(!this.pending||this.status!=='paused')return false;const token=this.token;try{this.setRate(this.rate);this.statusTo('loading');this.armTimeout(token);if(!this.audio)return false;await this.audio.play();if(token!==this.token||this.status==='paused')return false;this.statusTo('playing');return true;}catch(e){if(token===this.token){this.pending=false;this.statusTo('blocked');this.warn('輕觸上方播放按鈕，繼續角色語音。');}return false;}}
  armTimeout(token){clearTimeout(this.timeout);this.timeout=setTimeout(()=>{if(token===this.token&&this.status==='loading'){this.audio?.pause();this.pending=false;this.statusTo('error');this.warn('語音載入逾時，這段改用文字閱讀節奏。');}},12000);}
  async play(w,text){this.stop();const token=this.token;this.waiting=w;this.text=text;this.entry=this.entryFor(w);if(this.mode!=='recorded'||!this.entry||!String(text).trim()){this.statusTo('missing');return false;}this.pending=true;this.statusTo('loading');this.armTimeout(token);const hash=await root.crypto?.subtle?.digest?.('SHA-256',new TextEncoder().encode(text));if(token!==this.token)return false;if(hash&&this.entry.textSha256&&Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('')!==this.entry.textSha256){this.pending=false;clearTimeout(this.timeout);this.statusTo('missing');return false;}
   const finish=(status='ended')=>{if(token!==this.token)return;clearInterval(this.timer);clearTimeout(this.timeout);this.timer=null;this.pending=false;this.statusTo(status);};
   try{const a=this.obtain(this.entry.file);this.audio=a;a.volume=Math.min(1,Math.max(0,this.volume));this.setRate(this.rate);const start=Number(this.entry.start)||0,end=Number(this.entry.end),cut=Number.isFinite(end)&&end>start;let positioned=false;const seek=()=>{if(token!==this.token)return;if(!positioned){a.currentTime=start;positioned=true;}};const check=()=>{if(token!==this.token)return;if(cut&&a.currentTime>=end){a.pause();finish();}};
    a.onloadedmetadata=seek;if(a.readyState>=1)seek();a.ontimeupdate=check;a.onplaying=()=>{if(token!==this.token){a.pause();return;}seek();clearTimeout(this.timeout);if(this.status==='paused'){a.pause();return;}this.statusTo('playing');clearInterval(this.timer);this.timer=setInterval(check,30);};a.onended=()=>finish();a.onerror=()=>{if(token===this.token)this.warn('這句語音暫時無法載入，改用文字閱讀節奏。');finish('error');};if(this.status==='paused')return true;await a.play();if(token!==this.token){if(a!==this.audio)a.pause();return false;}return true;
   }catch(e){if(token===this.token){this.warn(e?.name==='NotAllowedError'?'輕觸上方播放按鈕，開啟角色語音。':'角色語音無法播放，改用文字閱讀節奏。');finish(e?.name==='NotAllowedError'?'blocked':'error');}return false;}
  }
  retry(){if(this.status==='blocked'&&this.audio){this.pending=true;this.statusTo('paused');return this.resume();}return this.replay();}
  replay(){return this.waiting?this.play(this.waiting,this.text):Promise.resolve(false);}
 }
 const api={Player,character,key};root.AzureVoice=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
