// نظام مصادقة محسن
class ImprovedAuth {
  constructor() {
    this.users = [
      { username: 'admin', password: this.hashPassword('admin123'), role: 'admin', permissions: ['all'] },
      { username: 'user1', password: this.hashPassword('user123'), role: 'user', permissions: ['contracts', 'reports'] }
    ];
  }

  // تشفير كلمة المرور (بسيط للتوضيح)
  hashPassword(password) {
    return btoa(password + 'yelo_salt');
  }

  // التحقق من كلمة المرور
  verifyPassword(inputPassword, hashedPassword) {
    return this.hashPassword(inputPassword) === hashedPassword;
  }

  // تسجيل دخول محسن
  async login(username, password) {
    const user = this.users.find(u => u.username === username);
    
    if (!user || !this.verifyPassword(password, user.password)) {
      return { success: false, message: 'بيانات خاطئة' };
    }

    const token = this.generateToken(user);
    const authData = {
      user: { username: user.username, role: user.role },
      token: token,
      permissions: user.permissions,
      expiry: Date.now() + (24 * 60 * 60 * 1000)
    };

    localStorage.setItem('yelo_auth', JSON.stringify(authData));
    return { success: true, user: authData.user };
  }

  // إنشاء token بسيط
  generateToken(user) {
    const payload = { username: user.username, timestamp: Date.now() };
    return btoa(JSON.stringify(payload));
  }

  // التحقق من صحة الجلسة
  validateSession() {
    const authData = localStorage.getItem('yelo_auth');
    if (!authData) return false;

    try {
      const parsed = JSON.parse(authData);
      return Date.now() < parsed.expiry;
    } catch {
      return false;
    }
  }
}

window.improvedAuth = new ImprovedAuth();