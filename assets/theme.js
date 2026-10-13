/* =========================================================
   CAMPUSCONNECT GLOBAL THEME
========================================================= */

(function() {
  
  "use strict";
  
  const THEME_KEY = "campusconnect-theme";
  
  /* -----------------------------------------------------
     APPLY THEME
  ----------------------------------------------------- */
  
  function applyTheme(theme) {
    
    let finalTheme = theme;
    
    if (theme === "system") {
      
      finalTheme = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches ?
        "dark" :
        "light";
    }
    
    if (finalTheme !== "dark" && finalTheme !== "light") {
      finalTheme = "light";
    }
    
    document.documentElement.setAttribute(
      "data-theme",
      finalTheme
    );
  }
  
  
  /* -----------------------------------------------------
     SET THEME
  ----------------------------------------------------- */
  
  function setTheme(theme) {
    
    if (!theme) {
      theme = "light";
    }
    
    localStorage.setItem(
      THEME_KEY,
      theme
    );
    
    applyTheme(theme);
  }
  
  
  /* -----------------------------------------------------
     LOAD SAVED THEME
  ----------------------------------------------------- */
  
  function loadTheme() {
    
    const savedTheme =
      localStorage.getItem(THEME_KEY) || "light";
    
    applyTheme(savedTheme);
  }
  
  
  /* -----------------------------------------------------
     PUBLIC API
  ----------------------------------------------------- */
  
  window.CampusConnectTheme = {
    
    setTheme: setTheme,
    
    loadTheme: loadTheme,
    
    getTheme: function() {
      return localStorage.getItem(THEME_KEY) || "light";
    }
    
  };
  
  
  /* -----------------------------------------------------
     LOAD IMMEDIATELY
  ----------------------------------------------------- */
  
  loadTheme();
  
  
  /* -----------------------------------------------------
     SYSTEM THEME CHANGE
  ----------------------------------------------------- */
  
  const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );
  
  mediaQuery.addEventListener(
    "change",
    function() {
      
      if (
        localStorage.getItem(THEME_KEY) === "system"
      ) {
        applyTheme("system");
      }
      
    }
  );
  
  
})();