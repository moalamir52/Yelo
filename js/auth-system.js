// نظام المصادقة المركزي
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userPermissions = [];
  }

  // فحص حالة تسجيل الدخول
  checkAuthStatus() {
    const authData = localStorage.getItem('yelo_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const now = new Date().getTime();
        
        // فحص انتهاء الصلاحية (24 ساعة)
        if (parsed.expiry && now < parsed.expiry) {
          this.currentUser = parsed.user;
          this.isAuthenticated = true;
          this.userPermissions = parsed.permissions || [];
          return true;
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('خطأ في قراءة بيانات المصادقة:', error);
        this.logout();
      }
    }
    return false;
  }

  // تسجيل الدخول
  async login(username, password) {
    try {
      // هنا هنضيف Firebase Authentication لاحقاً
      console.log('محاولة تسجيل دخول:', username);
      
      // مؤقتاً - للاختبار فقط
      if (username === 'admin' && password === 'admin123') {
        const authData = {
          user: {
            username: username,
            role: 'admin',
            loginTime: new Date().toISOString()
          },
          permissions: ['all'],
          expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 ساعة
        };
        
        localStorage.setItem('yelo_auth', JSON.stringify(authData));
        this.currentUser = authData.user;
        this.isAuthenticated = true;
        this.userPermissions = authData.permissions;
        
        // تسجيل النشاط
        this.logActivity('login', 'تسجيل دخول ناجح');
        
        return { success: true, user: authData.user };
      }
      
      return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }

  // تسجيل الخروج
  logout() {
    this.logActivity('logout', 'تسجيل خروج');
    localStorage.removeItem('yelo_auth');
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userPermissions = [];
  }

  // فحص الصلاحية للوصول لمشروع معين
  hasPermission(projectName) {
    if (!this.isAuthenticated) return false;
    if (this.userPermissions.includes('all')) return true;
    return this.userPermissions.includes(projectName);
  }

  // تسجيل الأنشطة
  logActivity(action, details) {
    const activity = {
      user: this.currentUser?.username || 'غير معروف',
      action: action,
      details: details,
      timestamp: new Date().toISOString(),
      ip: 'سيتم إضافته لاحقاً',
      userAgent: navigator.userAgent
    };

    // حفظ في localStorage مؤقتاً
    const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
    activities.push(activity);
    
    // الاحتفاظ بآخر 100 نشاط فقط
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }
    
    localStorage.setItem('yelo_activities', JSON.stringify(activities));
    
    console.log('تم تسجيل النشاط:', activity);
  }

  // الحصول على الأنشطة
  getActivities() {
    return JSON.parse(localStorage.getItem('yelo_activities') || '[]');
  }
}

// إنشاء instance واحد للنظام
const authSystem = new AuthSystem();

// فحص المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  authSystem.checkAuthStatus();
});

// تصدير للاستخدام في ملفات أخرى
window.authSystem = authSystem;