// YELO Authentication System - Admin Only
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userPermissions = [];
    this.initializeAdmin();
  }

  // Initialize default admin
  initializeAdmin() {
    const adminConfig = localStorage.getItem('yelo_admin_config');
    if (!adminConfig) {
      const defaultAdmin = {
        username: 'admin',
        password: 'admin123',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('yelo_admin_config', JSON.stringify(defaultAdmin));
    }
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
      this.logActivity(username, 'login_attempt', `محاولة تسجيل دخول من ${username}`);
      
      // فحص الأدمن
      const adminConfig = JSON.parse(localStorage.getItem('yelo_admin_config'));
      if (username === adminConfig.username && password === adminConfig.password) {
        const authData = {
          user: {
            username: username,
            role: 'admin',
            loginTime: new Date().toISOString()
          },
          permissions: ['all'],
          expiry: new Date().getTime() + (24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('yelo_auth', JSON.stringify(authData));
        this.currentUser = authData.user;
        this.isAuthenticated = true;
        this.userPermissions = authData.permissions;
        
        this.logActivity(username, 'login_success', 'تسجيل دخول ناجح للأدمن');
        return { success: true, user: authData.user };
      }
      
      // فحص المستخدمين العاديين
      const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
      const user = users.find(u => u.username === username && u.password === password && u.isActive);
      
      if (user) {
        const authData = {
          user: {
            username: user.username,
            role: user.role,
            loginTime: new Date().toISOString()
          },
          permissions: user.permissions,
          expiry: new Date().getTime() + (24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('yelo_auth', JSON.stringify(authData));
        this.currentUser = authData.user;
        this.isAuthenticated = true;
        this.userPermissions = authData.permissions;
        
        this.logActivity(username, 'login_success', 'تسجيل دخول ناجح');
        return { success: true, user: authData.user };
      }
      
      this.logActivity(username, 'login_failed', 'Login failed - Invalid credentials');
      return { success: false, message: 'Invalid username or password' };
      
    } catch (error) {
      console.error('Login error:', error);
      this.logActivity(username, 'login_error', `System error: ${error.message}`);
      return { success: false, message: 'An error occurred during login' };
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

  // User Management - Admin Only
  createUser(userData) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to create users');
    }
    
    const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
    
    if (users.find(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }
    
    const newUser = {
      id: Date.now(),
      username: userData.username,
      password: userData.password,
      role: userData.role || 'user',
      permissions: userData.permissions || [],
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    users.push(newUser);
    localStorage.setItem('yelo_users', JSON.stringify(users));
    
    this.logActivity(this.currentUser.username, 'user_created', `Created new user: ${userData.username}`);
    return newUser;
  }

  // Update user password
  updateUserPassword(username, newPassword) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to update passwords');
    }
    
    const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
    const user = users.find(u => u.username === username);
    
    if (user) {
      user.password = newPassword;
      localStorage.setItem('yelo_users', JSON.stringify(users));
      this.logActivity(this.currentUser.username, 'password_changed', `Changed password for user: ${username}`);
      return true;
    }
    
    throw new Error('User not found');
  }

  // Update admin password
  updateAdminPassword(newPassword) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to update admin password');
    }
    
    const adminConfig = JSON.parse(localStorage.getItem('yelo_admin_config'));
    adminConfig.password = newPassword;
    localStorage.setItem('yelo_admin_config', JSON.stringify(adminConfig));
    
    this.logActivity(this.currentUser.username, 'admin_password_changed', 'Admin password changed');
    return true;
  }

  // Get all users
  getAllUsers() {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to view users');
    }
    
    return JSON.parse(localStorage.getItem('yelo_users') || '[]');
  }

  // Get user passwords (Admin only)
  getUserPasswords() {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to view passwords');
    }
    
    const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
    const adminConfig = JSON.parse(localStorage.getItem('yelo_admin_config'));
    
    const passwords = {
      admin: adminConfig.password,
      users: users.map(u => ({ username: u.username, password: u.password }))
    };
    
    this.logActivity(this.currentUser.username, 'passwords_viewed', 'Viewed all passwords');
    return passwords;
  }

  // تحديث صلاحيات المستخدم
  updateUserPermissions(username, newPermissions) {
    if (!this.isAdmin()) {
      throw new Error('غير مصرح لك بتحديث الصلاحيات');
    }
    
    const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
    const user = users.find(u => u.username === username);
    
    if (user) {
      user.permissions = newPermissions;
      localStorage.setItem('yelo_users', JSON.stringify(users));
      this.logActivity(this.currentUser.username, 'permissions_updated', `تم تحديث صلاحيات المستخدم: ${username}`);
      return true;
    }
    
    throw new Error('المستخدم غير موجود');
  }

  // حذف مستخدم
  deleteUser(username) {
    if (!this.isAdmin()) {
      throw new Error('غير مصرح لك بحذف المستخدمين');
    }
    
    const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      localStorage.setItem('yelo_users', JSON.stringify(users));
      this.logActivity(this.currentUser.username, 'user_deleted', `تم حذف المستخدم: ${username}`);
      return true;
    }
    
    throw new Error('المستخدم غير موجود');
  }

  // فحص إذا كان المستخدم الحالي أدمن
  isAdmin() {
    return this.isAuthenticated && this.currentUser?.role === 'admin';
  }

  // تسجيل الأنشطة
  logActivity(user, action, details) {
    const activity = {
      user: user || 'غير معروف',
      action: action,
      details: details,
      timestamp: new Date().toISOString(),
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
    activities.push(activity);
    
    // الاحتفاظ بآخر 200 نشاط
    if (activities.length > 200) {
      activities.splice(0, activities.length - 200);
    }
    
    localStorage.setItem('yelo_activities', JSON.stringify(activities));
    console.log('تم تسجيل النشاط:', activity);
  }

  // الحصول على IP العميل (تقريبي)
  getClientIP() {
    // في التطبيق الحقيقي يمكن استخدام خدمة خارجية
    return 'Local';
  }

  // الحصول على الأنشطة
  getActivities() {
    return JSON.parse(localStorage.getItem('yelo_activities') || '[]');
  }
}

// إنشاء instance واحد للنظام
const authSystem = new AuthSystem();

// تصدير للاستخدام في ملفات أخرى
window.authSystem = authSystem;