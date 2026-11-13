'use strict';
((root)=>{
 const M=root.AzurePropsManifest,cache=new Map();let serial=0,current='';
 const resolve=x=>root.AzureData.assets?.[x]||x;
 function load(name){if(!cache.has(name))cache.set(name,new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=resolve('assets/hd/'+name+'.webp')}));return cache.get(name)}
 function clear(){serial++;current='';document.getElementById('prop-layer').hidden=true;document.getElementById('game').dataset.prop='false';}
 async function render(line){const id=root.AzureRemake.mode==='hd'&&line?.kind==='dialogue'?M.cues[line.key]:null;if(!id){clear();return;}if(id===current)return;const token=++serial,item=M.items[id];current=id;const layer=document.getElementById('prop-layer');layer.hidden=true;document.getElementById('game').dataset.prop='false';try{const im=await load(item.atlas);if(token!==serial)return;const c=document.getElementById('prop-art'),x=c.getContext('2d'),w=im.width/item.columns,h=im.height/item.rows;c.width=w;c.height=h;x.drawImage(im,id?item.cell%item.columns*w:0,Math.floor(item.cell/item.columns)*h,w,h,0,0,w,h);if(item.photo){const photo=await load(item.photo);if(token!==serial)return;x.save();x.beginPath();x.rect(110,153,287,215);x.clip();const scale=Math.max(287/photo.width,215/photo.height),pw=photo.width*scale,ph=photo.height*scale;x.drawImage(photo,110+(287-pw)/2,153+(215-ph)/2,pw,ph);x.restore();}layer.dataset.item=id;document.getElementById('prop-title').textContent=item.title;c.setAttribute('aria-label',item.title);layer.hidden=false;document.getElementById('game').dataset.prop='true';}catch{if(token===serial)clear();}}
 root.AzureProps={render,clear,manifest:M,get current(){return current;}};
})(globalThis);
