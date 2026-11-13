'use strict';
((root,factory)=>{const api=factory();root.AzureCollection=api;if(typeof module==='object'&&module.exports)module.exports=api;})(globalThis,()=>{
 const descriptions={
 'shirt-front':'Ｓａｗａ親手設計的民宿特製Ｔ恤。白色衣料上畫著海洋、彩虹、白海豚，以及彩虹兩端的父親與小女孩，角落留著她的簽名。',
 'shirt-back':'同一件特製Ｔ恤的背面，印著彩虹天堂的衝浪招生海報。正面與背面各有截然不同的用意。',
 earring:'扶桑花造型的耳墜。海風鎮把這種耳飾視為互許鍾情的紀念物，也讓人想起海神寺的傳說。',
 frame:'以海浪雕花與白海豚裝飾的相框。細緻的邊框，等待著一張值得留下的照片。',
 'frame-photo':'放入合照後的白海豚相框。原本空著的位置，現在收著兩個人共同留下的夏日回憶。',
 kite:'一只白色風箏，配著細線和握把。要讓它飛起來，需要風，也需要一點耐心。',
 phone:'以翔隨身攜帶的按鍵手機，可以通話、收簡訊與拍照。旅途中許多聯繫和影像，都留在這個小小螢幕裡。',
 letter:'一張仔細摺起的紙條。文字仍留在故事的那一刻，這裡保存它被展開時的模樣。',
 parcel:'以紙和繩結包好的小包裹，上面夾著便箋。交付的物件，也承載著交付者的心意。',
 surfboard:'彩虹天堂展示的衝浪板，板身帶有小小的彩虹標誌。衝浪是民宿生活裡不可缺少的一部分。',
 'old-photo':'一張有摺痕的黑白舊照。照片裡的男子踩著衝浪板站上浪頭，留下自信而驕傲的瞬間。',
 shell:'從海灘撿起的純白貝殼。海水把表面磨得圓潤光滑，像一份簡單的夏日小禮物。',
 leaflet:'帆船公園試膽大會的活動傳單，記載著比賽規則和獎品。沿著傳單的邀請，旅程又多了一場夜間活動。',
 'memory-card':'手機裡的小小記憶卡。將它交給相館，就能把螢幕裡的影像洗成實體照片。',
 'photo-case':'收著煙火合照的透明保護盒。薄薄的盒子，把那個夜晚的色彩小心保存下來。',
 ice:'裝滿各種水果的大碗剉冰，色彩繽紛又清涼。再平常的小吃，也可以成為一次特別的體驗。',
 juice:'商店街買來的冰果汁。杯壁凝著水珠，是炎熱海風裡的一點涼意。',
 tea:'裝在啤酒杯裡的冰麥茶。清脆的冰塊聲和熟悉的香味，陪著民宿吧台前的閒聊。',
 rainbow:'七種利口酒依比重疊成彩虹，杯口抹上一圈鹽。這杯調酒，是Ｓａｗａ反覆研究的「彩虹天堂」。',
 'surfer-drink':'改良後的彩虹天堂。深海藍的酒液湧出氣泡，微型衝浪人偶隨著泡沫浮起，像在杯中征服海浪。',
 'burnt-bbq':'第一次烤肉留下的焦黑烤串，旁邊還放著烤肉刷。料理不一定成功，嘗試的心情卻值得記得。',
 'sea-deity':'海神寺供奉的神像。人們在像前合掌祈禱，將心願寄託在海風鎮流傳的古老信仰裡。',
 backpack:'裝著換洗衣物的旅行背包。從抵達海風鎮開始，它就陪著以翔走過小鎮的道路。',
 camera:'旅途中帶著的小型相機，用來記錄眼前的風景。照片讓一閃而過的景色有了停留的方式。',
 breakfast:'彩虹天堂的民宿早餐。忙著準備餐點的早晨，也是旅程裡另一種日常。',
 jacket:'夜晚去海邊時披上的輕便外套。夏天的海風到了夜裡，也會帶來幾分涼意。',
 amulet:'海神寺周邊販售的護身符，上頭繡著海浪紋飾。小小物件，寄託著旅人對平安的期待。'
 };
 class Collection{
  constructor(data,art,props,lines,stored){this.data=data;this.art=art;this.props=props;this.lines=lines;this.keys=new Set();if(stored?.schema===1&&stored.source===data.sourceHash)this.capture({source:stored.source,seen:stored.keys});}
  capture(snapshot){if(snapshot?.source!==this.data.sourceHash||!Array.isArray(snapshot.seen))return false;let changed=false;for(const key of snapshot.seen.slice(0,6000)){const line=this.lines.get(key);if(line?.text.trim()&&!this.keys.has(key)){this.keys.add(key);changed=true;}}return changed;}
  scope(tab='people',character=null,outfit='all'){const list=this.list(tab);return tab==='people'?list.filter(x=>x.type==='portrait'&&x.character===character&&(outfit==='all'||x.outfit===outfit)):list;}
  groups(){const groups=new Map();for(const item of this.list().filter(x=>x.type==='portrait')){if(!groups.has(item.character))groups.set(item.character,{id:item.character,type:'person',title:item.title,representative:item,entries:[],outfits:[]});const g=groups.get(item.character);g.entries.push(item);if(g.representative.close&&!item.close)g.representative=item;if(!g.outfits.some(x=>x.id===item.outfit))g.outfits.push({id:item.outfit,title:item.outfitTitle});}return [...groups.values()];}
  serialize(){return JSON.stringify({schema:1,source:this.data.sourceHash,keys:[...this.keys]});}
  list(tab='people'){
   const result=new Map(),names=new Set([...this.keys].map(k=>this.lines.get(k)?.name));
   const nameFor=k=>k.startsWith('1')||k.startsWith('close-')?(names.has('星奈')?'星奈':'紫髮女孩'):k.startsWith('2')?(names.has('星紗')?'星紗':'紫髮女子'):k.startsWith('3')?([...names].some(n=>/Sawa|Ｓａｗａ/i.test(n||''))?'Ｓａｗａ':'民宿主人'):(names.has('劉蠻')?'劉蠻':'公園的男子');
   const outfits={'white-sundress':'白色洋裝','blue-sundress':'藍色洋裝','pink-swimsuit':'海邊服裝','pink-beachwear':'粉色花衫','green-beachwear':'綠色洋裝','pink-jacket':'粉色外衫','floral-shirt':'花襯衫'};
   for(const key of this.keys){const line=this.lines.get(key),e=this.data.events.find(e=>e.id===line.scene);if(!e)continue;
    if(tab==='props'){const id=this.props.cues[key],p=this.props.items[id];if(p&&!result.has(id))result.set(id,{id,type:'prop',prop:id,title:p.title,description:descriptions[id]||'在旅途中看見的一件物品。',scene:e.title,key});continue;}
    const sprite=this.art.scenePortraits[e.id]||(line.portrait_mode===4?line.sprite_resource:null),m=this.art.portraits[sprite];
    if(m&&tab!=='special'){const close=!!this.art.scenePortraits[e.id]&&![71,104,121].includes(e.id),id='portrait:'+m.atlas+':'+m.cell+':'+close;if(!result.has(id))result.set(id,{id,type:'portrait',sprite,close,character:sprite.startsWith('close-')?'xingnai':sprite.startsWith('1')?'xingnai':sprite.startsWith('2')?'xingsha':sprite.startsWith('3')?'sawa':'liuman',outfit:m.outfit,outfitTitle:outfits[m.outfit]||'人物美術',title:nameFor(sprite),subtitle:(outfits[m.outfit]||'人物美術')+(close?' · 劇情特寫':' · 立繪'),description:close?'旅途中已見過的情節特寫，保留那一刻的構圖與神情。':'旅途中實際見過的表情與服裝。可開啟全螢幕，欣賞完整構圖。',scene:e.title,key});}
    for(const bg of e.backgrounds){if(!bg.startsWith('map030')||!this.art.backgrounds[bg])continue;const id='cg:'+bg;if(!result.has(id))result.set(id,{id,type:'cg',image:this.art.backgrounds[bg],title:({'map03001':'意外的靠近','map03002':'煙火下的合照','map03003':'海風中的心意'})[this.art.backgrounds[bg]]||'旅途中的一瞬',subtitle:'劇情畫面',description:'在這段旅途中，已經看過的故事畫面。',scene:e.title,key});}
   }return [...result.values()];
  }
 }
 return{Collection,descriptions};
});
