// CampusConnect Route & Role Guard
(function() {
  const currentPath = window.location.pathname;

  // Only guard /Dashboard/ routes
  if (!currentPath.includes('/Dashboard/')) {
    return;
  }

  // Determine required role from path
  let requiredRole = null;
  if (currentPath.includes('/Dashboard/Admin/')) requiredRole = 'admin';
  else if (currentPath.includes('/Dashboard/Faculty/')) requiredRole = 'faculty';
  else if (currentPath.includes('/Dashboard/Student/')) requiredRole = 'student';

  const isLoggedIn = sessionStorage.getItem("campusConnectLoggedIn") === "true";
  const userRole = sessionStorage.getItem("campusConnectRole");

  if (!isLoggedIn) {
    console.warn("[CampusConnect] Unauthorized access blocked. Redirecting to login...");
    window.location.replace('/Login/login.html');
    return;
  }

  if (requiredRole && userRole && userRole !== requiredRole && userRole !== 'admin') {
    console.warn(`[CampusConnect] Role mismatch. ${userRole} attempted to access ${requiredRole} route.`);
    if (userRole === 'student') {
      window.location.replace('/Dashboard/Student/student-dashboard.html');
    } else if (userRole === 'faculty') {
      window.location.replace('/Dashboard/Faculty/faculty-dashboard.html');
    } else {
      window.location.replace('/Dashboard/Admin/admin-dashboard.html');
    }
    return;
  }

  // Wire automatic logout on any logout button
  document.addEventListener('DOMContentLoaded', function() {
    const logoutBtns = document.querySelectorAll('#logoutButton, .logout-button, #headerLogoutButton');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
          if (window.CampusConnectFirebase && window.CampusConnectFirebase.logoutUser) {
            await window.CampusConnectFirebase.logoutUser();
          }
        } catch (err) {
          console.error("Logout error:", err);
        }
        sessionStorage.clear();
        localStorage.removeItem("campusConnectRemember");
        window.location.replace('/Login/login.html');
      });
    });
  });
})();
