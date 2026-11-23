# 立坑封底方數紀錄

手機與電腦共用的公開 PWA 網頁，使用 Firebase Firestore 即時同步。

## 已包含功能
- 記錄人孔名稱、澆置方數、日期與備註
- 即時同步列表、依名稱／備註搜尋
- 新增、編輯及刪除確認
- 刪除採軟刪除，從一般列表隱藏，但保留資料與異動歷史
- 修改紀錄保存時間與修改前後內容（免登入，因此不記錄操作者身分）
- 匯出有效紀錄為 CSV（Excel 可開啟）
- 響應式版面與 PWA 安裝資訊

## Firebase 設定
此專案已將使用者提供的 Firebase Web App 設定放在 `index.html` 前端。Firebase Web 設定可被瀏覽器讀取；Firestore 安全規則才是存取控制。此版本按需求不使用登入，公開規則代表任何人都可能直接存取或破壞資料。請勿存放個人、機密或敏感資訊，並留意 Firebase 用量與費用。

Firestore 需建立資料庫，並使用與此應用程式集合相符的規則：

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{recordId} {
      allow read, create, update, delete: if true;
    }
    match /history/{historyId} {
      allow read, create: if true;
    }
  }
}
```

應用程式會自動建立 `records` 與 `history` 集合，不必手動建立文件。`history` 只追加不更新，前端刪除使用軟刪除。請勿另加會擴大權限的全域規則。

## 發佈到 GitHub Pages
1. 開啟此 GitHub 儲存庫的 **Settings → Pages**。
2. 在 **Build and deployment** 選 **Deploy from a branch**。
3. Branch 選 `main`，資料夾選 `/(root)`，按 **Save**。
4. 等待 Pages 完成部署，網址會顯示在 Pages 設定頁，格式通常為 `https://wayne00329.github.io/sewer-manhole-concrete-record/`。
5. 用手機及電腦開啟同一網址測試新增、修改、歷史紀錄及 CSV 匯出。手機可從瀏覽器選「加入主畫面」。

若第一次連線顯示權限錯誤，確認 Firebase 專案已啟用 Cloud Firestore、規則已發佈，而且 Firebase 設定中的 `projectId` 與專案一致。資料讀寫需要網路；離線時只會快取網頁外殼，不會離線寫入資料。
