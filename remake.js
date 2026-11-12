'use strict';
((root)=>{
 const M=root.AzureRemakeManifest||{},D=root.AzureData,$=id=>document.getElementById(id);let serial=0,mode='hd';
 const resolve=x=>D.assets?.[x]||x;
 function path(x){return resolve('assets/hd/'+x+'.webp');}
 function assetImage(src){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src;});}
 const atlasCache=new Map();
 async function drawPortrait(sprite){const mapping=M.portraits?.[sprite];if(!mapping||mode==='original')return false;const token=++serial,c=$('portrait');try{if(!atlasCache.has(mapping.atlas))atlasCache.set(mapping.atlas,assetImage(path(mapping.atlas)));const im=await atlasCache.get(mapping.atlas);if(token!==serial)return true;const cols=mapping.columns||3,rows=mapping.rows||2,cw=im.width/cols,ch=im.height/rows;c.width=Math.round(cw);c.height=Math.round(ch);const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(im,(mapping.cell%cols)*cw,Math.floor(mapping.cell/cols)*ch,cw,ch,0,0,c.width,c.height);c.hidden=false;c.dataset.remake='true';c.dataset.sprite=sprite;c.dataset.atlas=mapping.atlas;return true;}catch{if(token===serial)c.dataset.remake='false';return false;}}
 function clearPortrait(){serial++;$('portrait').dataset.remake='false';}
 function background(e){const blank=e.backgrounds.every(n=>n==='map01000.png');const cg=e.backgrounds[0].startsWith('map030');const name=M.backgrounds?.[e.backgrounds[0]];const layer=$('hd-background');if(mode==='original'||blank||!name){layer.hidden=true;$('game').dataset.hd='false';return false;}$('hd-backdrop').style.backgroundImage='url("'+path(name)+'")';layer.src=path(name);layer.onerror=()=>{layer.hidden=true;$('game').dataset.hd='false';};layer.hidden=false;$('game').dataset.hd='true';$('game').dataset.cg=String(cg);$('game').dataset.environment=e.backgrounds[0]==='map01001.png'||e.backgrounds[0]==='map01002.png'?'sea':e.backgrounds[0]==='map01009.png'?'forest':'still';const overlays=e.backgrounds.some(n=>n.startsWith('map020'));$('game').dataset.illustrated=String(overlays);return true;}
 // Character closeups encoded in original map layers need their own mapped pose.
 function scenePortrait(e){if(mode==='original')return null;return M.scenePortraits?.[e.id]||null;}
 function setMode(value){mode=value==='original'?'original':'hd';document.body.dataset.art=mode;serial++;if(mode==='original')$('hd-background').hidden=true;return mode;}
 root.AzureRemake={drawPortrait,clearPortrait,background,scenePortrait,setMode,get mode(){return mode;},manifest:M};
})(globalThis);
