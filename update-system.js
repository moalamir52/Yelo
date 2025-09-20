// YELO System Update Script
// Run this in browser console to update the system

console.log('🔄 Starting YELO System Update...');

// Clear old authentication data
localStorage.removeItem('isAuthenticated');
localStorage.removeItem('userName');
localStorage.removeItem('userRole');

// Initialize new admin config if not exists
if (!localStorage.getItem('yelo_admin_config')) {
  const adminConfig = {
    username: 'admin',
    password: 'admin123',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('yelo_admin_config', JSON.stringify(adminConfig));
  console.log('✅ Admin config initialized');
}

// Clear old auth session
localStorage.removeItem('yelo_auth');

// Initialize empty users array if not exists
if (!localStorage.getItem('yelo_users')) {
  localStorage.setItem('yelo_users', JSON.stringify([]));
  console.log('✅ Users array initialized');
}

// Initialize empty activities array if not exists
if (!localStorage.getItem('yelo_activities')) {
  localStorage.setItem('yelo_activities', JSON.stringify([]));
  console.log('✅ Activities array initialized');
}

console.log('✅ YELO System Update Complete!');
console.log('📋 System Status:');
console.log('- Admin: admin/admin123');
console.log('- Users: ' + JSON.parse(localStorage.getItem('yelo_users')).length);
console.log('- Activities: ' + JSON.parse(localStorage.getItem('yelo_activities')).length);
console.log('🔄 Please refresh the page to apply changes');