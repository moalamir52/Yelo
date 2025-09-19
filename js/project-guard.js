// نظام حماية المشاريع - يتم إضافته لكل مشروع منفصل
class ProjectGuard {
  constructor(projectName) {
    this.projectName = projectName;
    this.yeloBaseUrl = 'https://moalamir52.github.io/Yelo/'; // رابط لوحة التحكم الرئيسية
    this.init();
  }

  init() {
    // فحص المصادقة عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
      this.checkAccess();
    });
  }

  checkAccess() {
    try {
      // فحص وجود بيانات المصادقة
      const authData = localStorage.getItem('yelo_auth');
      
      if (!authData) {
        this.redirectToLogin('لم يتم تسجيل الدخول');
        return;
      }

      const parsed = JSON.parse(authData);
      const now = new Date().getTime();

      // فحص انتهاء الصلاحية
      if (!parsed.expiry || now >= parsed.expiry) {
        this.redirectToLogin('انتهت صلاحية الجلسة');
        return;
      }

      // فحص الصلاحيات
      const permissions = parsed.permissions || [];
      if (!permissions.includes('all') && !permissions.includes(this.projectName)) {
        this.showAccessDenied();
        return;
      }

      // تسجيل دخول المستخدم للمشروع
      this.logProjectAccess(parsed.user);
      
      // إظهار شريط المستخدم
      this.showUserBar(parsed.user);

    } catch (error) {
      console.error('خطأ في فحص الوصول:', error);
      this.redirectToLogin('حدث خطأ في التحقق من الهوية');
    }
  }

  redirectToLogin(reason) {
    // إظهار رسالة وإعادة توجيه
    const overlay = this.createOverlay(
      'تسجيل الدخول مطلوب',
      reason + '<br><br>سيتم توجيهك لصفحة تسجيل الدخول...',
      'warning'
    );
    
    setTimeout(() => {
      window.location.href = this.yeloBaseUrl + 'login.html';
    }, 3000);
  }

  showAccessDenied() {
    const overlay = this.createOverlay(
      'الوصول مرفوض',
      'ليس لديك صلاحية للوصول إلى هذا المشروع.<br><br>تواصل مع المدير للحصول على الصلاحيات المطلوبة.',
      'danger'
    );

    // إضافة زر العودة للوحة التحكم
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-primary mt-3';
    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> العودة للوحة التحكم';
    backBtn.onclick = () => window.location.href = this.yeloBaseUrl;
    
    overlay.querySelector('.overlay-content').appendChild(backBtn);
  }

  createOverlay(title, message, type) {
    // إنشاء overlay للرسائل
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    const iconClass = type === 'warning' ? 'fa-exclamation-triangle' : 'fa-ban';
    const colorClass = type === 'warning' ? '#ff9800' : '#f44336';

    overlay.innerHTML = `
      <div class="overlay-content" style="
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      ">
        <i class="fas ${iconClass}" style="
          font-size: 48px;
          color: ${colorClass};
          margin-bottom: 20px;
        "></i>
        <h3 style="color: #333; margin-bottom: 15px;">${title}</h3>
        <p style="color: #666; line-height: 1.6;">${message}</p>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  showUserBar(user) {
    // إنشاء شريط المستخدم
    const userBar = document.createElement('div');
    userBar.id = 'projectUserBar';
    userBar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      background: rgba(106, 27, 154, 0.95);
      color: white;
      padding: 10px 20px;
      border-radius: 0 0 0 15px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 15px;
      backdrop-filter: blur(10px);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    userBar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-user-circle"></i>
        <span>${user.username}</span>
      </div>
      <a href="${this.yeloBaseUrl}" style="
        background: rgba(255, 214, 0, 0.2);
        border: 1px solid #ffd600;
        color: #ffd600;
        padding: 5px 12px;
        border-radius: 8px;
        text-decoration: none;
        transition: all 0.3s ease;
        font-size: 12px;
      " onmouseover="this.style.background='#ffd600'; this.style.color='#6a1b9a';" 
         onmouseout="this.style.background='rgba(255, 214, 0, 0.2)'; this.style.color='#ffd600';">
        <i class="fas fa-home"></i> لوحة التحكم
      </a>
      <button onclick="projectGuard.logout()" style="
        background: rgba(255, 0, 0, 0.2);
        border: 1px solid #ff4444;
        color: #ff4444;
        padding: 5px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 12px;
      " onmouseover="this.style.background='#ff4444'; this.style.color='white';" 
         onmouseout="this.style.background='rgba(255, 0, 0, 0.2)'; this.style.color='#ff4444';">
        <i class="fas fa-sign-out-alt"></i> خروج
      </button>
    `;

    document.body.appendChild(userBar);
  }

  logProjectAccess(user) {
    // تسجيل دخول المستخدم للمشروع
    const activity = {
      user: user.username,
      action: 'project_access',
      details: `دخول إلى مشروع: ${this.projectName}`,
      timestamp: new Date().toISOString(),
      project: this.projectName,
      ip: 'سيتم إضافته لاحقاً',
      userAgent: navigator.userAgent
    };

    // حفظ في localStorage
    const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
    activities.push(activity);
    
    // الاحتفاظ بآخر 100 نشاط فقط
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }
    
    localStorage.setItem('yelo_activities', JSON.stringify(activities));
  }

  logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      // تسجيل نشاط الخروج
      const authData = JSON.parse(localStorage.getItem('yelo_auth') || '{}');
      if (authData.user) {
        const activity = {
          user: authData.user.username,
          action: 'logout',
          details: `تسجيل خروج من مشروع: ${this.projectName}`,
          timestamp: new Date().toISOString(),
          project: this.projectName,
          userAgent: navigator.userAgent
        };

        const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
        activities.push(activity);
        localStorage.setItem('yelo_activities', JSON.stringify(activities));
      }

      // مسح بيانات المصادقة
      localStorage.removeItem('yelo_auth');
      
      // إعادة توجيه لصفحة تسجيل الدخول
      window.location.href = this.yeloBaseUrl + 'login.html';
    }
  }
}

// دالة سهلة للاستخدام في المشاريع
function initProjectGuard(projectName) {
  window.projectGuard = new ProjectGuard(projectName);
}

// تصدير للاستخدام العام
window.ProjectGuard = ProjectGuard;
window.initProjectGuard = initProjectGuard;