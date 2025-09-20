// حماية مباشرة للمشاريع - يتم إضافتها في بداية كل مشروع
(function() {
  'use strict';
  
  console.log('🛡️ YELO Direct Protection System loaded');
  console.log('🔗 Current URL:', window.location.href);
  
  // إخفاء المحتوى فوراً حتى يتم التحقق
  document.documentElement.style.display = 'none';
  
  // فحص إذا كان الوصول من خلال نظام الحماية
  const urlParams = new URLSearchParams(window.location.search);
  const isProtected = urlParams.get('protected');
  console.log('🔍 Protected parameter:', isProtected);
  
  // إذا لم يكن محمي، فحص المصادقة
  if (!isProtected) {
    console.log('⚠️ No protection parameter found, checking authentication...');
    // مسح أي بيانات demo قديمة فوراً
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('demo_user');
    
    // فحص المصادقة من YELO فقط
    const authData = localStorage.getItem('yelo_auth');
    console.log('📋 Auth data from localStorage:', authData ? 'Found' : 'Not found');
    
    if (!authData) {
      console.error('❌ No auth data found, redirecting to login');
      alert('🚫 Access Denied!\n\nThis project is protected by YELO Security System.\nPlease login through the main dashboard.');
      window.location.replace('https://yelo-dashboard.web.app/login.html');
      return;
    }
    
    try {
      const parsed = JSON.parse(authData);
      const now = new Date().getTime();
      
      // فحص انتهاء الصلاحية ومنع demo users
      if (!parsed.expiry || now >= parsed.expiry || !parsed.user || parsed.user.username === 'demo' || parsed.user.username === 'Demo User') {
        localStorage.clear(); // مسح كل شيء
        alert('⏰ Session Expired!\n\nYour session has expired. Please login again.');
        window.location.replace('https://yelo-dashboard.web.app/login.html');
        return;
      }
      
      // تحديد اسم المشروع من الرابط
      const projectName = getProjectNameFromURL();
      console.log('📁 Project name detected:', projectName);
      console.log('👤 User permissions:', parsed.permissions);
      
      // فحص الصلاحية
      const hasPermission = parsed.permissions.includes('all') || parsed.permissions.includes(projectName);
      console.log('🔐 Permission check result:', hasPermission);
      
      if (!hasPermission) {
        console.warn('🚫 Access denied for project:', projectName);
        alert(`🚫 Access Denied!\n\nYou don't have permission to access ${projectName.toUpperCase()} project.\n\nContact your administrator for access.`);
        
        // تسجيل محاولة الوصول غير المصرح بها
        logUnauthorizedAccess(parsed.user.username, projectName);
        
        window.location.replace('https://yelo-dashboard.web.app/');
        return;
      }
      
      // تسجيل الوصول الناجح
      logSuccessfulAccess(parsed.user.username, projectName);
      
      // إضافة شريط المستخدم
      addSecurityBar(parsed.user, projectName);
      
      // بدء مراقبة الجلسة المستمرة
      startSessionMonitoring(parsed.user.username, projectName);
      
      console.log('✅ All checks passed, showing content');
      // إظهار المحتوى بعد التحقق
      document.documentElement.style.display = 'block';
      
    } catch (error) {
      console.error('❌ Auth parsing error:', error);
      localStorage.removeItem('yelo_auth');
      alert('❌ Authentication Error!\n\nThere was an error verifying your credentials.\nPlease login again.');
      window.location.replace('https://yelo-dashboard.web.app/login.html');
      return;
    }
  } else {
    console.log('✅ Protected parameter found, showing content directly');
    // إذا كان محمي، إظهار المحتوى
    document.documentElement.style.display = 'block';
  }
  
  // مراقبة تغييرات localStorage
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    // منع إضافة بيانات قديمة
    const blockedKeys = ['isAuthenticated', 'userName', 'userRole', 'demo_user', 'currentUser'];
    if (blockedKeys.includes(key)) {
      console.warn('🚫 Blocked attempt to set old auth data:', key);
      return;
    }
    originalSetItem.call(this, key, value);
  };
  
  // مراقبة فقدان التركيز (معطلة مؤقتاً)
  // window.addEventListener('blur', function() {
  //   setTimeout(function() {
  //     const authData = localStorage.getItem('yelo_auth');
  //     if (!authData) {
  //       window.location.replace('https://moalamir52.github.io/Yelo/login.html');
  //     }
  //   }, 5000);
  // });
  
  // مراقبة إغلاق النافذة
  window.addEventListener('beforeunload', function() {
    // مسح أي بيانات قديمة عند الإغلاق
    const oldKeys = ['isAuthenticated', 'userName', 'userRole', 'demo_user'];
    oldKeys.forEach(key => localStorage.removeItem(key));
  });
  
  // تحديد اسم المشروع من الرابط
  function getProjectNameFromURL() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // استخراج اسم المشروع من الرابط
    if (hostname.includes('github.io')) {
      const parts = pathname.split('/');
      const projectPart = parts[1] || '';
      return projectPart.toLowerCase();
    }
    
    return 'unknown';
  }
  
  // تسجيل محاولة الوصول غير المصرح بها
  function logUnauthorizedAccess(username, projectName) {
    const activity = {
      user: username,
      action: 'unauthorized_direct_access',
      details: `Attempted direct access to ${projectName} without permission`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
    activities.push(activity);
    
    if (activities.length > 200) {
      activities.splice(0, activities.length - 200);
    }
    
    localStorage.setItem('yelo_activities', JSON.stringify(activities));
  }
  
  // تسجيل الوصول الناجح
  function logSuccessfulAccess(username, projectName) {
    const activity = {
      user: username,
      action: 'direct_project_access',
      details: `Successfully accessed ${projectName} directly`,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
    activities.push(activity);
    
    if (activities.length > 200) {
      activities.splice(0, activities.length - 200);
    }
    
    localStorage.setItem('yelo_activities', JSON.stringify(activities));
  }
  
  // مراقبة الجلسة المستمرة
  function startSessionMonitoring(username, projectName) {
    // فحص كل 30 ثانية (أقل تدخلاً)
    setInterval(function() {
      const authData = localStorage.getItem('yelo_auth');
      
      if (!authData) {
        console.warn('No auth data found');
        return; // لا تطرد فوراً
      }
      
      try {
        const parsed = JSON.parse(authData);
        const now = new Date().getTime();
        
        // فحص انتهاء الصلاحية فقط
        if (parsed.expiry && now >= parsed.expiry) {
          forceLogout('⏰ Session Expired!\n\nYour session has expired.\nPlease login again.');
          return;
        }
        
        // مسح بيانات قديمة بهدوء
        const oldData = ['isAuthenticated', 'userName', 'userRole', 'demo_user'];
        oldData.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
          }
        });
        
      } catch (error) {
        console.error('Auth monitoring error:', error);
      }
    }, 30000); // كل 30 ثانية
  }
  
  // طرد فوري مع مسح الكاش
  function forceLogout(message) {
    // مسح شامل لجميع البيانات
    localStorage.clear();
    sessionStorage.clear();
    
    // محاولة مسح الكوكيز
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    alert(message);
    window.location.replace('https://yelo-dashboard.web.app/login.html');
  }
  
  // إضافة شريط الأمان
  function addSecurityBar(user, projectName) {
    const securityBar = document.createElement('div');
    securityBar.id = 'yelo-security-bar';
    securityBar.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, #6a1b9a 0%, #8e24aa 100%);
        color: white;
        padding: 8px 15px;
        z-index: 99999;
        font-family: Arial, sans-serif;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      ">
        <div style="display: flex; align-items: center; gap: 15px;">
          <span style="font-weight: bold; color: #ffd600;">🔒 YELO PROTECTED</span>
          <span>👤 ${user.username}</span>
          <span>📁 ${projectName.toUpperCase()}</span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="window.open('https://yelo-dashboard.web.app/', '_blank')" style="
            background: rgba(255,214,0,0.2);
            border: 1px solid #ffd600;
            color: #ffd600;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
          ">Dashboard</button>
          <button onclick="
            localStorage.removeItem('yelo_auth');
            alert('Logged out successfully!');
            window.location.href='https://yelo-dashboard.web.app/login.html';
          " style="
            background: rgba(255,0,0,0.2);
            border: 1px solid #ff4444;
            color: #ff4444;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
          ">Logout</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(securityBar);
    
    // إضافة margin للمحتوى لتجنب تداخل الشريط
    document.body.style.paddingTop = '40px';
  }
  
})();