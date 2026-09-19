/**
 * 雲端數位學習系統 (GitHub Pages 前端版) - 集中設定檔
 */
const CONFIG = {
  // 1. Google Cloud Console 申請的 OAuth 2.0 Client ID
  // 填入您已建立的 Client ID：
  GOOGLE_CLIENT_ID: '965487110017-ci0ocva34i1coe0s80u9t3q8vef65ilm.apps.googleusercontent.com',

  // 2. Google Apps Script 部署為 Web 應用程式的 Exec 網址
  // 部署完成後，請將產生的網址貼在此處，例如：'https://script.google.com/macros/s/AKfycbx.../exec'
  // 若此處留空，前端會自動啟用「本地完整模擬模式」，方便離線測試與預覽
  GAS_API_URL: 'https://script.google.com/macros/s/AKfycbzhrF7UhbZ_oP1yibNPXOFh9NTpe89ly1yXM73fph_z72maC-Gq8k5h4MXwiVihu1MlvA/exec',

  // 3. 系統基本資訊
  APP_NAME: '雲端課堂測驗與注音打字練習系統',
  VERSION: '2.0.0 (Decoupled GitHub Pages Edition)'
};
