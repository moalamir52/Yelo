// YELO Simple Authentication System - Works everywhere
class SimpleAuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userPermissions = [];
    this.initializeSystem();
  }

  initializeSystem() {
    // إنشاء المدير الافتراضي
    this.initializeAdmin();
    // فحص المصادقة الحالية
    this.checkAuthStatus();
  }

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
        
        this.logActivity(username, 'login_success', 'Admin login successful');
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
        
        this.logActivity(username, 'login_success', 'User login successful');
        return { success: true, user: authData.user };
      }
      
      this.logActivity(username, 'login_failed', 'Invalid credentials');
      return { success: false, message: 'Invalid username or password' };
      
    } catch (error) {
      console.error('Login error:', error);
      this.logActivity(username, 'login_error', `System error: ${error.message}`);
      return { success: false, message: 'An error occurred during login' };
    }
  }

  logout() {
    this.logActivity(this.currentUser?.username || 'unknown', 'logout', 'User logged out');
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
    
    this.logActivity(this.currentUser.username, 'user_created', `Created user: ${userData.username}`);
    return newUser;
  }

  getAllUsers() {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to view users');
    }
    return JSON.parse(localStorage.getItem('yelo_users') || '[]');
  }

  updateUserPermissions(username, newPermissions) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to update permissions');
    }
    
    const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
    const user = users.find(u => u.username === username);
    
    if (user) {
      user.permissions = newPermissions;
      localStorage.setItem('yelo_users', JSON.stringify(users));
      this.logActivity(this.currentUser.username, 'permissions_updated', `Updated permissions for: ${username}`);
      return true;
    }
    
    throw new Error('User not found');
  }

  deleteUser(username) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to delete users');
    }
    
    const users = JSON.parse(localStorage.getItem('yelo_users') || '[]');
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      localStorage.setItem('yelo_users', JSON.stringify(users));
      this.logActivity(this.currentUser.username, 'user_deleted', `Deleted user: ${username}`);
      return true;
    }
    
    throw new Error('User not found');
  }

  logActivity(user, action, details) {
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
    console.log('Activity logged:', activity);
  }

  getActivities() {
    return JSON.parse(localStorage.getItem('yelo_activities') || '[]');
  }
}

// إنشاء النظام البسيط
const simpleAuthSystem = new SimpleAuthSystem();

// استبدال النظام القديم
window.authSystem = simpleAuthSystem;

console.log('✅ Simple Auth System loaded successfully');