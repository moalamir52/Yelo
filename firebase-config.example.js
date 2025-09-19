// Firebase Configuration Template
// انسخ الملف ده وسميه firebase-config.js وحط فيه بياناتك الحقيقية

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Admin Configuration
const adminConfig = {
  adminEmail: "your-admin-email@company.com",
  adminPassword: "your-secure-admin-password",
  masterKey: "your-master-key-for-admin-access"
};

export { firebaseConfig, adminConfig };