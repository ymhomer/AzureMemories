'use strict';
/* A separate photographic cast; no animation frames or face patches are borrowed from drawn art. */
((root)=>{
 const M=root.AzureRemakeManifest,outfits={'white-sundress':'xingnai-white-atlas','blue-sundress':'xingnai-blue-atlas','pink-swimsuit':'xingnai-beach-atlas','pink-beachwear':'sawa-pink-atlas','green-beachwear':'sawa-green-atlas','pink-jacket':'xingsha-atlas','floral-shirt':'liuman-atlas-v2'},cache=new Map();
 const bodies={'white-sundress':'xingnai-white-body','blue-sundress':'xingnai-blue-body','pink-swimsuit':'xingnai-beach-body','pink-beachwear':'sawa-pink-body','green-beachwear':'sawa-green-body','pink-jacket':'xingsha-body','floral-shirt':'liuman-body'};
 const alias={'cg-kiss-blue-v014':'cg-moonlight-blue','cg-kiss-v014':'cg-reunion-white',map03002:'cg-fireworks-v014','swim-ring-v013':'swim-ring'};
 function path(name){return 'assets/realistic/'+(alias[name]||name)+'.webp';}
 function closed(m){return m.atlas==='star-swim-a'?m.cell===5:m.atlas==='sawa-a'?[4,5].includes(m.cell):m.atlas==='sawa-b'?[2,3].includes(m.cell):m.atlas==='supporting-six'?[2,5].includes(m.cell):m.cell===4;}
 function mapping(sprite,closeup=false){const m=M.portraits[sprite];if(!m)return null;const close=closeup||sprite.startsWith('close-'),dedicated=close&&m.outfit==='blue-sundress';let expression=closed(m)?4:(m.cell%6===4?0:m.cell%6);if(sprite.startsWith('close-lean-'))expression=[0,1,4,3][m.cell]||0;const full=bodies[m.outfit],hasBody=!!root.AzureRealisticGeometry?.[full],atlas=dedicated?'xingnai-blue-close':hasBody?full:outfits[m.outfit];if(!atlas)return null;const cell=dedicated?(expression===4?2:expression===5?3:expression%2):hasBody?0:expression;return{...m,atlas,cell,expression,columns:dedicated?2:hasBody?1:3,rows:hasBody&&!dedicated?1:2,close,cropClose:close&&!dedicated};}

 const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
 async function sheet(m){if(!cache.has(m.atlas)){const job=root.AzureResources.image(path(m.atlas)).then(im=>{const w=Math.round(im.width/m.columns),h=Math.round(im.height/m.rows),known=root.AzureRealisticGeometry?.[m.atlas];return{im,w,h,g:known,crop:known?.crop||{x:0,y:0,w,h}};});cache.set(m.atlas,job);job.catch(()=>cache.delete(m.atlas));if(cache.size>4)cache.delete(cache.keys().next().value);}return cache.get(m.atlas);}
 function frame(a,m,cell){const h=m.cropClose?Math.round(a.crop.h*.56):a.crop.h,c=canvas(a.crop.w,h);c.getContext('2d').drawImage(a.im,(cell%m.columns)*a.w+a.crop.x,Math.floor(cell/m.columns)*a.h+a.crop.y,a.crop.w,h,0,0,c.width,c.height);return c;}
 async function preparePortrait(sprite,closeup=false){const m=mapping(sprite,closeup);if(!m)return null;const a=await sheet(m),base=frame(a,m,m.cell);const f={base,patches:[],outfit:m.outfit,atlas:m.atlas,bodyAtlas:null},eyes=a.g?.landmarks?.[m.cell]?.eyes?.map(pt=>[pt[0]-a.crop.x,pt[1]-a.crop.y]);root.AzurePortraitMesh?.attach(f,eyes,{closed:m.expression===4});return f;}

 function assets(sprite,closeup=false){const m=mapping(sprite,closeup);return m?[path(m.atlas)]:[];}
 root.AzureRealistic={path,mapping,preparePortrait,assets,outfits};
})(globalThis);
