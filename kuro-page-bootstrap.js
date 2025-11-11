
// kuro-page-bootstrap.js
(function(){
  function killPreloader(){
    var p = document.querySelector('.preloader');
    if (p) { p.style.opacity = '0'; p.style.pointerEvents = 'none'; p.style.display = 'none'; }
    document.documentElement.classList.add('kuro-loaded');
    document.body.classList.add('kuro-loaded');
  }
  // Hide preloader asap
  document.addEventListener('DOMContentLoaded', killPreloader);
  window.addEventListener('load', killPreloader);
  setTimeout(killPreloader, 2000); // absolute fallback

  // If Firebase wiring is present, auto-attach on relevant pages
  document.addEventListener('DOMContentLoaded', function(){
    try{
      if (typeof window.kuroAttachFirebaseAuthHandlers === 'function' &&
          (document.getElementById('login-form') || document.getElementById('signup-form'))) {
        window.kuroAttachFirebaseAuthHandlers();
      }
      if (typeof window.kuroRenderFirebaseAgentDashboard === 'function' &&
          document.getElementById('student-list-body')) {
        window.kuroRenderFirebaseAgentDashboard();
      }
      if (typeof window.kuroRenderFirebaseAgentDetails === 'function' &&
          document.getElementById('student-details-container')) {
        window.kuroRenderFirebaseAgentDetails();
      }
    }catch(e){
      console.warn('KURO bootstrap warning:', e);
    }
  });
})();
