'use strict';
((root)=>{const chapters=[
 ['一段海風裡的回憶','歡迎來到《戀愛物語：湛藍回憶》。在海風鎮的夏天，跟著以翔走過相遇、選擇與告別，收藏那些閃閃發亮的片刻。'],
 ['原作與這個版本','原作、原故事與音樂：奧爾資訊。本網頁版是以使用者提供的 Java 手機版本為基礎，重新製作畫面、閱讀介面與觸控互動的非官方重製版。'],
 ['讓故事順著你的步調','輕觸畫面或按空白鍵、回車鍵讀下一段。選單的「閱讀」分類可以重播語音、查看對話紀錄、自動播放或快進已讀；字級與閱讀節奏可在設定調整。'],
 ['循著路牌去旅行','場景標記會帶你交談、觀察或查看路牌。路牌只顯示當下可選的去處；方位圖是為網頁版設計的導覽示意，海岸在下方，並非原作的精確行走地圖。'],
 ['不只是一列選項','對打以三回合指令與體力回饋呈現，換裝、點餐、保存與一般回應也有各自的介面。互動演出取自當下的劇情，選擇仍走原作的分支，沒有額外的隨機勝負或付費系統。'],
 ['聽見不同的聲音','角色使用不同的中文合成聲線，由 Microsoft Edge TTS 製作音檔。自動配音可使用戲劇字幕；語音不是真人演出，句內字幕時間仍有估算。原作與重繪的閱讀設定分開保留。'],
 ['把回憶好好留下','存檔保存在這個瀏覽器，沒有雲端同步。更換裝置或清除網站資料前，可先匯出存檔。章節、美術與結局收藏只展開已讀或已完成的內容，回顧不會覆蓋主線旅程。'],
 ['兩種美術，一段故事','可以在原作圖像與重繪之間切換。重繪採日系戀愛故事畫風，部分姿態共用表情；新增的結局紀念繪圖與淡入回憶演出是本版的新詮釋，不是原作的隱藏劇情。'],
 ['製作與協作','專案維護：ymhomer。網頁程式、介面與整理：Codex 協作。重繪美術：圖像生成工具輔助製作。感謝原作者留下這段故事，也謝謝每一次回報與耐心試玩。'],
 ['湛藍回憶 · 網頁版 1.0','單人故事・本機存檔・觸控與鍵盤。願你在這個夏天裡，找到屬於自己的回憶碎片。']
 ];
 function build(host,options={}){let auto=!matchMedia('(prefers-reduced-motion:reduce)').matches,speed=12,position=0,last=performance.now(),raf=0;const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};const area=node('div',undefined,'about-scroll');area.tabIndex=0;area.setAttribute('aria-label','關於說明，可手動捲動');const lead=node('div',undefined,'about-lead');lead.append(node('p','海風與星光','about-eyebrow'),node('h3','關於這段回憶'),node('p','戀愛物語：湛藍回憶 · 1.0'));area.append(lead);for(const[title,text]of chapters){const section=node('section',undefined,'about-chapter');section.append(node('span','✧','about-star'),node('h4',title),node('p',text));area.append(section);}area.append(node('p','那一年，海風依然記得。','about-farewell'));host.append(area);const controls=node('div',undefined,'about-controls'),toggle=node('button',auto?'暫停滾動':'開始滾動'),pace=node('button','標準速度'),intro=node('button','重播開場');controls.append(toggle,pace,intro);host.append(controls);function sync(){toggle.textContent=auto?'暫停滾動':area.scrollTop+area.clientHeight>=area.scrollHeight-3?'從頭重看':'繼續滾動';toggle.setAttribute('aria-pressed',String(auto));}const pause=()=>{auto=false;position=area.scrollTop;sync();};for(const event of ['wheel','pointerdown','keydown'])area.addEventListener(event,pause,{passive:true});toggle.onclick=()=>{if(area.scrollTop+area.clientHeight>=area.scrollHeight-3)area.scrollTop=0;position=area.scrollTop;auto=!auto;sync();};pace.onclick=()=>{speed=speed===12?18:speed===18?8:12;pace.textContent=speed===12?'標準速度':speed===18?'較快速度':'慢速閱讀';};intro.onclick=()=>{pause();options.replayIntro?.();};function tick(now){if(!area.isConnected)return;const dt=Math.min(100,now-last);last=now;if(auto&&!document.hidden){position+=speed*dt/1000;area.scrollTop=position;if(area.scrollTop+area.clientHeight>=area.scrollHeight-2){auto=false;sync();}}raf=requestAnimationFrame(tick);}raf=requestAnimationFrame(tick);return{pause,stop:()=>{auto=false;cancelAnimationFrame(raf);},area};}
 root.AzureAbout={build,chapters};
})(globalThis);
