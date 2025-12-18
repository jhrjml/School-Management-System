document.addEventListener("DOMContentLoaded", () => {
  
  // TABLES, BUTTON, DISPLAY INFORMATION AND MODAL
  const profileBtn = document.getElementById("profileBtn");
  const profileModal = document.getElementById("profileModal");
  const profileFullname = document.getElementById("profileFullname");
  const profileDisplay = document.getElementById("profileDisplay");
  const displayTeacherId = document.getElementById("displayTeacherId");
  const displayGender = document.getElementById("displayGender");
  const displayDOB = document.getElementById("displayDOB");
  const displayHD = document.getElementById("displayHD");
  const displayContact = document.getElementById("displayContact");
  const displayAddress = document.getElementById("displayAddress");
  const displayEmail = document.getElementById("displayEmail");
  const displaySalary = document.getElementById("displaySalary");
  const displayUsername = document.getElementById("displayUsername");
  const displayPassword = document.getElementById("displayPassword");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const closeProfileBtn = document.getElementById("closeProfileBtn");
  const profileForm = document.getElementById("profileForm");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const cancelProfileBtn = document.getElementById("cancelProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");


  //INPUT BY THE USER
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");
  
  // GET THE TEACHER INFORMATION
  let teacher = JSON.parse(sessionStorage.getItem("teacher")) || {};

  function populateProfile() {
    const fullName = `${teacher.firstname || ""} ${teacher.middlename || ""} ${teacher.lastname || ""}`.trim();
    profileFullname.textContent = fullName || "No Name";

    displayTeacherId.textContent = teacher.employeeId || teacher.teacherid || "";
    displayGender.textContent = teacher.gender || "";
    displayDOB.textContent = teacher.dob ? teacher.dob.split("T")[0] : "";
    displayHD.textContent = teacher.hd ? teacher.hd.split("T")[0] : "";
    displayContact.textContent = teacher.contactNumber || teacher.contactnumber || "";
    displayAddress.textContent = teacher.address || "";
    displayEmail.textContent = teacher.email || "";
    displaySalary.textContent = teacher.salary || "";
    displayUsername.textContent = teacher.username || "";
    displayPassword.textContent = teacher.password || "";
  }

  profileBtn.addEventListener("click", () => {
    populateProfile();
    profileModal.style.display = "flex";
    profileDisplay.style.display = "block";
    profileForm.style.display = "none";
    editProfileBtn.style.display = "inline-block";
    closeProfileBtn.style.display = "inline-block";
  });

  editProfileBtn.addEventListener("click", () => {
    profileForm.style.display = "block";
    profileDisplay.style.display = "none";
    editProfileBtn.style.display = "none";
    closeProfileBtn.style.display = "none";
    usernameInput.value = teacher.username || "";
    passwordInput.value = teacher.password || "";
  });

  cancelProfileBtn.addEventListener("click", () => {
    profileForm.style.display = "none";
    profileDisplay.style.display = "block";
    editProfileBtn.style.display = "inline-block";
    closeProfileBtn.style.display = "inline-block";
  });

  closeProfileBtn.addEventListener("click", () => {
    profileModal.style.display = "none";
  });

  saveProfileBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const updatedUsername = usernameInput.value.trim();
    const updatedPassword = passwordInput.value.trim();

    if (!updatedUsername || !updatedPassword) {
      alert("Username and password cannot be empty");
      return;
    }

    try {
      const res = await fetch("/updateTeacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: teacher.id,
          username: updatedUsername,
          password: updatedPassword
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to update profile");
        return;
      }

      teacher.username = updatedUsername;
      teacher.password = updatedPassword;
      sessionStorage.setItem("teacher", JSON.stringify(teacher));

      alert("Profile updated successfully!");
      profileForm.style.display = "none";
      profileDisplay.style.display = "block";
      editProfileBtn.style.display = "inline-block";
      closeProfileBtn.style.display = "inline-block";

      populateProfile();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    }
  });

  profileModal.addEventListener("click", (e) => {
    if (e.target === profileModal) profileModal.style.display = "none";
  });

  function showModal(modal) {
    modal.style.display = "flex";
  }

  function hideModal(modal) {
    modal.style.display = "none";
  }

  logoutBtn.addEventListener("click", () => showModal(logoutModal));
  cancelLogoutBtn.addEventListener("click", () => hideModal(logoutModal));
  confirmLogoutBtn.addEventListener("click", () => {
    sessionStorage.clear(); 
    window.location.href = "login.html";
  });

  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) hideModal(logoutModal);
  });

  populateProfile();
});
