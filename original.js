'use strict';
/* Original artwork has its own native composition. No HD camera assumptions. */
((root)=>{
 const D=root.AzureData,cache=new Map(),bounds=new Map();
 const make=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
 function image(path){if(!cache.has(path))cache.set(path,new Promise((ok,no)=>{root.AzureResources.image(path).then(ok,no);}));if(cache.size>8)cache.delete(cache.keys().next().value);const result=cache.get(path);result.catch(()=>cache.delete(path));return result;}
 async function sprite(key,index=0){const s=D.sprites[key];if(!s)return null;const sheets=await Promise.all(s.sheets.map(x=>image(x.image))),c=make(s.width,s.height),x=c.getContext('2d',{willReadFrequently:true});
  function paint(f){x.clearRect(0,0,c.width,c.height);for(const[layer,px,py,t]of [...f.parts].reverse()){const[si,ri]=s.layers[layer],r=s.sheets[si].rects[ri];x.save();x.translate(px+r[2]/2,py+r[3]/2);if(t!==0)throw Error('Unsupported original transform');x.drawImage(sheets[si],...r,-r[2]/2,-r[3]/2,r[2],r[3]);x.restore();}}
  if(!bounds.has(key)){let l=c.width,top=c.height,r=0,b=0;for(const f of s.frames){paint(f);const a=x.getImageData(0,0,c.width,c.height).data;for(let y=0;y<c.height;y++)for(let z=0;z<c.width;z++)if(a[(y*c.width+z)*4+3]>24){l=Math.min(l,z);r=Math.max(r,z);top=Math.min(top,y);b=Math.max(b,y);}}bounds.set(key,{x:Math.max(0,l-1),y:Math.max(0,top-1),w:Math.max(1,r-l+3),h:Math.max(1,b-top+3)});}
  paint(s.frames[index%s.frames.length]);const b=bounds.get(key),out=make(b.w,b.h);out.getContext('2d').drawImage(c,b.x,b.y,b.w,b.h,0,0,b.w,b.h);return out;
 }
 async function scene(e){const c=make(240,288),x=c.getContext('2d');for(let l=0;l<3;l++){const name=e.backgrounds[l];if(!D.images[name])continue;const im=await image('assets/images/'+name),cols=Math.floor(im.width/24);for(const[i,raw]of e.tiles[l].entries()){const t=raw<0?e.tileAnimations[l][-raw-1]?.[0]||0:raw;if(t<=0)continue;const sy=Math.floor((t-1)/cols)*24;if(sy+24<=im.height)x.drawImage(im,((t-1)%cols)*24,sy,24,24,i%10*24,Math.floor(i/10)*24,24,24);}}return c;}
 root.AzureOriginal={sprite,scene};
})(globalThis);
