document.addEventListener("DOMContentLoaded", () => {

  //LOGOUT 
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  logoutBtn.onclick = () => logoutModal.style.display = "flex";
  cancelLogoutBtn.onclick = () => logoutModal.style.display = "none";
  confirmLogoutBtn.onclick = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "login.html";
  };
});
