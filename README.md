# AzureMemories

戀愛物語：湛藍回憶

服裝、對話穩定與眨眼修復版 **0.6**。

**[開始遊戲](https://ymhomer.github.io/AzureMemories/)**

- 單人故事、手機觸控／桌面鍵盤、多比例構圖。
- 28張重繪資源，原45組人物狀態加上13個劇情特寫映射；原故事189事件。
- 存檔只保留在瀏覽器，可匯出／匯入JSON；不需要帳號。
- 點對話／Enter／Space繼續；右上選單可存讀檔、切換美術、字級與閱讀設定。
- 使用 Edge TTS 預先生成中文 MP3，主要角色各有不同聲線；部分配角共用基礎聲線並有固定語速／音高設定。
- 不使用手機內建朗讀，也不在缺音時自動切回裝置配音。原371段空白、無語音文字及章節／地點字卡不配音。
- Edge TTS 不具真人式尖叫或完整情緒表演，未將一般朗讀宣稱為真人演出。
- 部分道具、服裝與姿勢仍有差異；原缺失事件182明示保留。

- 對話區預設位於場景外，保留完整原圖；右上「看圖」可隱藏介面，點場景返回時不跳過台詞。
- 設定分成文字／畫面／聲音三頁；畫面頁可選原作／重繪美術及保留畫面／覆蓋式對話。
- 補回俯身特寫、哀傷／害羞與拿相框、吃冰的道具構圖；重繪與原作服裝、細節仍可能有差異。

- 修正白裙表情圖混入襯衫、藍裙／泳裝混用，以及海邊道具特寫服裝錯誤；少數CG服裝細節仍保留舊畫面。
- 對話區高度固定，逐字顯示或姓名欄切換不再改變場景大小；覆蓋式人物去除透明留白後以場景高度定位。
- 重繪人物加入局部眨眼，不替換嘴型或服裝；尊重減少動態效果設定。

## 驗證

七種尺寸的瀏覽器檢查、兩條結局核心路線及10項語音機制測試通過；不代表實體手機／全分支窮舉或正式配音聽感驗證。

## 發布

遊戲前端為純HTML/CSS/JavaScript。main更新由GitHub Actions以固定版本Edge TTS生成／快取語音，完整覆蓋驗證通過後才發布GitHub Pages；語音檔不放進Git歷史。開啟「開始遊戲」後可聽中文角色語音，右上選單可關閉語音或重播本句。

本機建置：Python3.14安裝 tools/edge-requirements.lock → node tools/edge-plan.cjs edge-plan.json → python tools/build-edge-site.py → python tools/edge-generate.py --plan edge-plan.json --site _site --cache .edge-audio-cache → python tools/validate-edge-build.py。失敗可重跑，會核對並重用完整快取。網站使用相對資源路徑，支援 /AzureMemories/ 專案子路徑；正式網址下的存檔與下載HTML可能屬於不同瀏覽器儲存區，請用JSON匯入。

原故事、原曲與保留的原版素材：奧爾資訊。新圖使用AI重新繪製；本倉庫不宣稱原作素材開源。Noto Sans TC依SIL Open Font License使用，見 assets/fonts/OFL.txt。
