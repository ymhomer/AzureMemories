'use strict';
((root)=>{
 const M=root.AzureRemakeManifest||{},D=root.AzureData,$=id=>document.getElementById(id);let serial=0,mode='hd';
 const resolve=x=>D.assets?.[x]||x;
 function path(x){return resolve('assets/hd/'+x+'.webp');}
 function assetImage(src){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src;});}
 const atlasCache=new Map();
 async function drawPortrait(sprite){const mapping=M.portraits?.[sprite];if(!mapping||mode==='original')return false;const token=++serial,c=$('portrait');try{if(!atlasCache.has(mapping.atlas))atlasCache.set(mapping.atlas,assetImage(path(mapping.atlas)));const im=await atlasCache.get(mapping.atlas);if(token!==serial)return true;const cw=im.width/3,ch=im.height/2;c.width=Math.round(cw);c.height=Math.round(ch);const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(im,(mapping.cell%3)*cw,Math.floor(mapping.cell/3)*ch,cw,ch,0,0,c.width,c.height);c.hidden=false;c.dataset.remake='true';return true;}catch{if(token===serial)c.dataset.remake='false';return false;}}
 function clearPortrait(){serial++;$('portrait').dataset.remake='false';}
 function background(e){const blank=e.backgrounds.every(n=>n==='map01000.png');const cg=e.backgrounds[0].startsWith('map030');const name=M.backgrounds?.[e.backgrounds[0]];const layer=$('hd-background');if(mode==='original'||blank||!name){layer.hidden=true;$('game').dataset.hd='false';return false;}$('hd-backdrop').style.backgroundImage='url("'+path(name)+'")';layer.src=path(name);layer.onerror=()=>{layer.hidden=true;$('game').dataset.hd='false';};layer.hidden=false;$('game').dataset.hd='true';$('game').dataset.cg=String(cg);$('game').dataset.environment=e.backgrounds[0]==='map01001.png'||e.backgrounds[0]==='map01002.png'?'sea':e.backgrounds[0]==='map01009.png'?'forest':'still';const overlays=e.backgrounds.some(n=>n.startsWith('map020'));$('game').dataset.illustrated=String(overlays);return true;}
 // Character closeups encoded in original map layers need their own mapped pose.
 function scenePortrait(e){if(mode==='original'||!e.backgrounds.some(n=>n.startsWith('map020')))return null;const l=e.backgrounds[2],base=e.backgrounds[0];if(base==='map01009.png')return '1002_p';if(base==='map01002.png')return '1025_p';if(base==='map01001.png'){if(l==='map02001c.png')return '1003_p';if(l==='map02001a.png')return '1021_p';if(l==='map02001b.png')return '1026_p';return '1001_p';}if(l==='map02001a.png')return '1019_p';if(l==='map02001f.png')return '1001_p';return '1008_p';}
 function setMode(value){mode=value==='original'?'original':'hd';document.body.dataset.art=mode;serial++;if(mode==='original')$('hd-background').hidden=true;return mode;}
 root.AzureRemake={drawPortrait,clearPortrait,background,scenePortrait,setMode,get mode(){return mode;},manifest:M};
})(globalThis);
