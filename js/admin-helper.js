// Admin Helper Functions
function logActivity(user, action, details) {
  const activity = {
    user: user,
    action: action,
    details: details,
    timestamp: new Date().toISOString()
  };
  
  const activities = JSON.parse(localStorage.getItem('yelo_activities') || '[]');
  activities.push(activity);
  
  if (activities.length > 100) {
    activities.splice(0, activities.length - 100);
  }
  
  localStorage.setItem('yelo_activities', JSON.stringify(activities));
}