// YELO Project Guard - حماية المشاريع الخارجية
(function() {
  'use strict';
  
  // فحص فوري للمصادقة
  function checkAuth() {
    // محاولة الحصول على بيانات المصادقة من YELO
    const authData = localStorage.getItem('yelo_auth');
    
    if (!authData) {
      redirectToLogin();
      return false;
    }
    
    try {
      const parsed = JSON.parse(authData);
      const now = new Date().getTime();
      
      // فحص انتهاء الصلاحية
      if (!parsed.expiry || now >= parsed.expiry || !parsed.user) {
        localStorage.removeItem('yelo_auth');
        redirectToLogin();
        return false;
      }
      
      return parsed;
    } catch (error) {
      localStorage.removeItem('yelo_auth');
      redirectToLogin();
      return false;
    }
  }
  
  // إعادة التوجيه لصفحة تسجيل الدخول
  function redirectToLogin() {
    alert('Access Denied! Please login through YELO system first.');
    window.location.replace('https://moalamir52.github.io/Yelo/login.html');
  }
  
  // فحص الصلاحية للمشروع
  function checkProjectPermission(projectName, authData) {
    if (!authData || !authData.permissions) {
      return false;
    }
    
    // المدير له صلاحية لكل شيء
    if (authData.permissions.includes('all')) {
      return true;
    }
    
    // فحص الصلاحية المحددة
    return authData.permissions.includes(projectName);
  }
  
  // تسجيل النشاط
  function logActivity(user, action, details) {
    const activity = {
      user: user || 'Unknown',
      action: action,
      details: details,
      timestamp: new Date().toISOString(),
      project: window.location.hostname + window.location.pathname
    };
    
    const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
    activities.push(activity);
    
    if (activities.length > 200) {
      activities.splice(0, activities.length - 200);
    }
    
    localStorage.setItem('yelo_activities', JSON.stringify(activities));
  }
  
  // الدالة الرئيسية لحماية المشروع
  window.initProjectGuard = function(projectName) {
    // فحص المصادقة
    const authData = checkAuth();
    if (!authData) {
      return;
    }
    
    // فحص الصلاحية للمشروع
    if (!checkProjectPermission(projectName, authData)) {
      alert(`Access Denied! You don't have permission for: ${projectName}`);
      logActivity(authData.user.username, 'access_denied', `Access denied for project: ${projectName}`);
      window.location.replace('https://moalamir52.github.io/Yelo/');
      return;
    }
    
    // تسجيل الوصول الناجح
    logActivity(authData.user.username, 'project_access', `Successfully accessed project: ${projectName}`);
    
    // إضافة شريط المستخدم
    addUserBar(authData.user);
    
    console.log(`✅ Project Guard: Access granted for ${authData.user.username} to ${projectName}`);
  };
  
  // إضافة شريط المستخدم
  function addUserBar(user) {
    const userBar = document.createElement('div');
    userBar.innerHTML = `
      <div style="position: fixed; top: 0; right: 0; background: rgba(106, 27, 154, 0.95); color: white; padding: 8px 15px; border-radius: 0 0 0 10px; z-index: 9999; font-size: 12px; display: flex; align-items: center; gap: 10px;">
        <span>👤 ${user.username}</span>
        <button onclick="window.location.href='https://moalamir52.github.io/Yelo/'" style="background: rgba(255,214,0,0.2); border: 1px solid #ffd600; color: #ffd600; padding: 3px 8px; border-radius: 5px; cursor: pointer; font-size: 11px;">Dashboard</button>
        <button onclick="localStorage.removeItem('yelo_auth'); window.location.reload();" style="background: rgba(255,0,0,0.2); border: 1px solid #ff4444; color: #ff4444; padding: 3px 8px; border-radius: 5px; cursor: pointer; font-size: 11px;">Logout</button>
      </div>
    `;
    document.body.appendChild(userBar);
  }
  
  // فحص تلقائي عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    // إذا لم يتم استدعاء initProjectGuard خلال 3 ثوان، فحص عام
    setTimeout(function() {
      if (!window.projectGuardInitialized) {
        const authData = checkAuth();
        if (authData) {
          addUserBar(authData.user);
        }
      }
    }, 3000);
  });
  
})();