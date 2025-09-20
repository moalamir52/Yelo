// YELO Hybrid Authentication System (Firebase + localStorage)
class HybridAuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userPermissions = [];
    this.useFirebase = false;
    this.initializeSystem();
  }

  async initializeSystem() {
    // محاولة استخدام Firebase أولاً
    try {
      if (window.firebaseAuthSystem) {
        this.useFirebase = true;
        console.log('✅ Using Firebase Authentication');
        // نسخ البيانات من Firebase
        this.currentUser = window.firebaseAuthSystem.currentUser;
        this.isAuthenticated = window.firebaseAuthSystem.isAuthenticated;
        this.userPermissions = window.firebaseAuthSystem.userPermissions;
      } else {
        throw new Error('Firebase not available');
      }
    } catch (error) {
      console.log('⚠️ Firebase not available, using localStorage');
      this.useFirebase = false;
      this.initializeLocalSystem();
    }
  }

  initializeLocalSystem() {
    // النظام المحلي القديم
    const adminConfig = localStorage.getItem('yelo_admin_config');
    if (!adminConfig) {
      const defaultAdmin = {
        username: 'admin',
        password: 'admin123',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('yelo_admin_config', JSON.stringify(defaultAdmin));
    }
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const authData = localStorage.getItem('yelo_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const now = new Date().getTime();
        
        if (parsed.expiry && now < parsed.expiry) {
          this.currentUser = parsed.user;
          this.isAuthenticated = true;
          this.userPermissions = parsed.permissions || [];
          return true;
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        this.logout();
      }
    }
    return false;
  }

  async login(username, password) {
    try {
      if (this.useFirebase && window.firebaseAuthSystem) {
        // استخدام Firebase
        const result = await window.firebaseAuthSystem.login(username, password);
        if (result.success) {
          this.currentUser = result.user;
          this.isAuthenticated = true;
          this.userPermissions = window.firebaseAuthSystem.userPermissions;
        }
        return result;
      } else {
        // استخدام النظام المحلي
        return await this.localLogin(username, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      // في حالة فشل Firebase، جرب النظام المحلي
      if (this.useFirebase) {
        console.log('Firebase failed, trying local system');
        return await this.localLogin(username, password);
      }
      return { success: false, message: 'Login failed' };
    }
  }

  async localLogin(username, password) {
    // النظام المحلي القديم
    this.logActivity(username, 'login_attempt', `Login attempt from ${username}`);
    
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
      
      this.logActivity(username, 'login_success', 'Admin login successful (local)');
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
      
      this.logActivity(username, 'login_success', 'User login successful (local)');
      return { success: true, user: authData.user };
    }
    
    this.logActivity(username, 'login_failed', 'Invalid credentials (local)');
    return { success: false, message: 'Invalid username or password' };
  }

  logout() {
    if (this.useFirebase && window.firebaseAuthSystem) {
      window.firebaseAuthSystem.logout();
    }
    
    localStorage.removeItem('yelo_auth');
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userPermissions = [];
  }

  hasPermission(projectName) {
    if (!this.isAuthenticated) return false;
    if (this.userPermissions.includes('all')) return true;
    return this.userPermissions.includes(projectName);
  }

  isAdmin() {
    return this.isAuthenticated && this.currentUser?.role === 'admin';
  }

  async createUser(userData) {
    if (this.useFirebase && window.firebaseAuthSystem) {
      return await window.firebaseAuthSystem.createUser(userData);
    } else {
      // النظام المحلي
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
      
      this.logActivity(this.currentUser.username, 'user_created', `Created user: ${userData.username} (local)`);
      return newUser;
    }
  }

  async getAllUsers() {
    if (this.useFirebase && window.firebaseAuthSystem) {
      return await window.firebaseAuthSystem.getAllUsers();
    } else {
      if (!this.isAdmin()) {
        throw new Error('Not authorized to view users');
      }
      return JSON.parse(localStorage.getItem('yelo_users') || '[]');
    }
  }

  logActivity(user, action, details) {
    if (this.useFirebase && window.firebaseAuthSystem) {
      window.firebaseAuthSystem.logActivity(user, action, details);
    } else {
      // النظام المحلي
      const activity = {
        user: user || 'unknown',
        action: action,
        details: details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
      activities.push(activity);
      
      if (activities.length > 200) {
        activities.splice(0, activities.length - 200);
      }
      
      localStorage.setItem('yelo_activities', JSON.stringify(activities));
      console.log('Activity logged (local):', activity);
    }
  }

  async getActivities() {
    if (this.useFirebase && window.firebaseAuthSystem) {
      return await window.firebaseAuthSystem.getActivities();
    } else {
      return JSON.parse(localStorage.getItem('yelo_activities') || '[]');
    }
  }
}

// إنشاء النظام الهجين
const hybridAuthSystem = new HybridAuthSystem();

// تحديث النظام القديم
window.authSystem = hybridAuthSystem;