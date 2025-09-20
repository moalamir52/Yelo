// YELO Firebase Authentication System
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgiftsiW60t7kFw9QIBRR_Br7HgGM4Eyo",
  authDomain: "yelo-dashboard.firebaseapp.com",
  projectId: "yelo-dashboard",
  storageBucket: "yelo-dashboard.firebasestorage.app",
  messagingSenderId: "706142812376",
  appId: "1:706142812376:web:54e4846a93047fdeea3fad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirebaseAuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userPermissions = [];
    this.initializeSystem();
  }

  async initializeSystem() {
    // إنشاء المدير الافتراضي في Firebase
    await this.createDefaultAdmin();
    // فحص المصادقة المحلية
    this.checkLocalAuth();
  }

  async createDefaultAdmin() {
    try {
      const adminRef = doc(db, 'admins', 'default');
      const adminDoc = await getDoc(adminRef);
      
      if (!adminDoc.exists()) {
        await setDoc(adminRef, {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          permissions: ['all'],
          createdAt: new Date().toISOString(),
          isActive: true
        });
        console.log('Default admin created in Firebase');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  checkLocalAuth() {
    const authData = localStorage.getItem('yelo_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const now = new Date().getTime();
        
        if (parsed.expiry && now < parsed.expiry && parsed.user) {
          this.currentUser = parsed.user;
          this.isAuthenticated = true;
          this.userPermissions = parsed.permissions || [];
          return true;
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error checking local auth:', error);
        this.logout();
      }
    }
    return false;
  }

  async login(username, password) {
    try {
      await this.logActivity(username, 'login_attempt', `Login attempt from ${username}`);
      
      // فحص المدير
      const adminRef = doc(db, 'admins', 'default');
      const adminDoc = await getDoc(adminRef);
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        if (username === adminData.username && password === adminData.password) {
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
          
          await this.logActivity(username, 'login_success', 'Admin login successful');
          return { success: true, user: authData.user };
        }
      }
      
      // فحص المستخدمين العاديين
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.username === username && userData.password === password && userData.isActive) {
          const authData = {
            user: {
              username: userData.username,
              role: userData.role,
              loginTime: new Date().toISOString()
            },
            permissions: userData.permissions,
            expiry: new Date().getTime() + (24 * 60 * 60 * 1000)
          };
          
          localStorage.setItem('yelo_auth', JSON.stringify(authData));
          this.currentUser = authData.user;
          this.isAuthenticated = true;
          this.userPermissions = authData.permissions;
          
          await this.logActivity(username, 'login_success', 'User login successful');
          return { success: true, user: authData.user };
        }
      }
      
      await this.logActivity(username, 'login_failed', 'Invalid credentials');
      return { success: false, message: 'Invalid username or password' };
      
    } catch (error) {
      console.error('Login error:', error);
      await this.logActivity(username, 'login_error', `System error: ${error.message}`);
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

  async createUser(userData) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to create users');
    }
    
    try {
      const userRef = doc(db, 'users', userData.username);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        throw new Error('Username already exists');
      }
      
      const newUser = {
        username: userData.username,
        password: userData.password,
        role: userData.role || 'user',
        permissions: userData.permissions || [],
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      await setDoc(userRef, newUser);
      await this.logActivity(this.currentUser.username, 'user_created', `Created user: ${userData.username}`);
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to view users');
    }
    
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const users = [];
      
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async updateUserPermissions(username, newPermissions) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to update permissions');
    }
    
    try {
      const userRef = doc(db, 'users', username);
      await updateDoc(userRef, { permissions: newPermissions });
      await this.logActivity(this.currentUser.username, 'permissions_updated', `Updated permissions for: ${username}`);
      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  async deleteUser(username) {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to delete users');
    }
    
    try {
      const userRef = doc(db, 'users', username);
      await deleteDoc(userRef);
      await this.logActivity(this.currentUser.username, 'user_deleted', `Deleted user: ${username}`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async logActivity(user, action, details) {
    try {
      const activity = {
        user: user || 'unknown',
        action: action,
        details: details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      const activityRef = doc(collection(db, 'activities'));
      await setDoc(activityRef, activity);
      
      console.log('Activity logged:', activity);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getActivities() {
    if (!this.isAdmin()) {
      throw new Error('Not authorized to view activities');
    }
    
    try {
      const activitiesRef = collection(db, 'activities');
      const activitiesSnapshot = await getDocs(activitiesRef);
      const activities = [];
      
      activitiesSnapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      // ترتيب حسب التاريخ
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return activities;
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  }
}

// إنشاء النظام وتصديره
const firebaseAuthSystem = new FirebaseAuthSystem();
window.firebaseAuthSystem = firebaseAuthSystem;

export default firebaseAuthSystem;