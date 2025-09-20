// مثال على إعدادات Firebase - انسخ هذا الملف إلى firebase-config.js وأدخل بياناتك الحقيقية
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// تصدير الإعدادات
window.firebaseConfig = firebaseConfig;