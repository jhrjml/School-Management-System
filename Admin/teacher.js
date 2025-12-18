document.addEventListener("DOMContentLoaded", () => {
  // API URL
  const TEACHER_API_URL = "http://localhost:3000/teachers";
  let teachers = [];

  // TABLE, SEARCH, BUTTONS, VIEW, ADD, DELETE AND LOGOUT MODAL
  const teacherTableBody = document.getElementById("teacherTableBody");
  const addTeacherBtn = document.querySelector(".btn-add");
  const searchInput = document.getElementById("teacherSearch");
  const addModal = document.getElementById("addTeacherModal");
  const addTeacherForm = document.getElementById("addTeacherForm");
  const cancelAddBtn = document.getElementById("cancelAddBtn");
  const viewModal = document.getElementById("viewTeacherModal");
  const closeViewBtn = document.getElementById("closeViewBtn");
  const confirmModal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  // INPUTS BY THE USER
  const firstNameInput = document.getElementById("firstName");
  const middleNameInput = document.getElementById("middleName");
  const lastNameInput = document.getElementById("lastName");
  const teacherIdInput = document.getElementById("empId");
  const genderInput = document.getElementById("gender");
  const dobInput = document.getElementById("dob");
  const contactNumberInput = document.getElementById("contactNum");
  const emailInput = document.getElementById("email");
  const salaryInput = document.getElementById("salary");
  const addressInput = document.getElementById("address");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const hdInput = document.getElementById("hd");

  let teacherToDeleteIndex = null;
  let editIndex = null;

  // FORMAT DATE
  function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  }

  // LOAD THE TEACHERS
  async function loadTeachers() {
    const res = await fetch(TEACHER_API_URL);
    teachers = await res.json();

    teachers.sort((a, b) => Number(a.teacherid) - Number(b.teacherid));
    renderTeacherTable(teachers);
  }

  // RENDER THE TABLE
  function renderTeacherTable(list) {
    teacherTableBody.innerHTML = "";

    if (!list.length) {
      teacherTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">No results found</td>
        </tr>
      `;
      return;
    }

    list.forEach((t, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.teacherid}</td>
        <td>${t.firstname} ${t.middlename || ""} ${t.lastname}</td>
        <td>${t.contactnumber}</td>
        <td>${t.email}</td>
        <td>
          <button class="icon-btn" data-view="${i}"><i class="fas fa-eye"></i></button>
          <button class="icon-btn" data-edit="${i}"><i class="fas fa-edit"></i></button>
          <button class="icon-btn" data-delete="${i}"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      teacherTableBody.appendChild(tr);
    });

    addRowListeners();
  }

  // SEARCH THE NAME OF THE TEACHER
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase().trim();
    const filtered = teachers.filter(t => {
    const fullName = `${t.firstname} ${t.middlename || ""} ${t.lastname}`.toLowerCase();
    const teacherId = String(t.teacherid);

      return fullName.includes(keyword) || teacherId.includes(keyword);
    });

    renderTeacherTable(filtered);
  });

  function addRowListeners() {
    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.onclick = () => openView(btn.dataset.view);
    });
    document.querySelectorAll("[data-edit]").forEach(btn => {
      btn.onclick = () => openEdit(btn.dataset.edit);
    });
    document.querySelectorAll("[data-delete]").forEach(btn => {
      btn.onclick = () => openDeleteModal(btn.dataset.delete);
    });
  }

  addTeacherBtn.onclick = () => {
    editIndex = null;
    addTeacherForm.reset();
    showModal(addModal);
  };

  cancelAddBtn.onclick = () => hideModal(addModal);
  
  addTeacherForm.addEventListener("submit", async e => {
    e.preventDefault();

    if (contactNumberInput.value.length !== 11) {
      alert("Contact number must be exactly 11 digits.");
      return;
    }

    const data = {
      teacherid: teacherIdInput.value,
      firstname: firstNameInput.value,
      middlename: middleNameInput.value,
      lastname: lastNameInput.value,
      gender: genderInput.value,
      dob: dobInput.value,
      hd: hdInput.value,
      email: emailInput.value,
      contactnumber: contactNumberInput.value,
      address: addressInput.value,
      salary: salaryInput.value,
      username: usernameInput.value,
      password: passwordInput.value
    };

    if (editIndex === null) {
      await fetch(TEACHER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      const id = teachers[editIndex].id;
      await fetch(`${TEACHER_API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }

    hideModal(addModal);
    loadTeachers();
  });

  function openEdit(i) {
    const t = teachers[i];
    editIndex = i;

    teacherIdInput.value = t.teacherid;
    firstNameInput.value = t.firstname;
    middleNameInput.value = t.middlename;
    lastNameInput.value = t.lastname;
    genderInput.value = t.gender;
    dobInput.value = formatDateForInput(t.dob);
    hdInput.value = formatDateForInput(t.hd);
    emailInput.value = t.email;
    contactNumberInput.value = t.contactnumber;
    addressInput.value = t.address;
    salaryInput.value = t.salary;
    usernameInput.value = t.username;
    passwordInput.value = t.password;

    showModal(addModal);
  }

  function openDeleteModal(i) {
    teacherToDeleteIndex = i;
    const t = teachers[i];
    confirmMessage.textContent = `Delete ${t.firstname} ${t.lastname}?`;
    showModal(confirmModal);
  }

  cancelConfirmBtn.onclick = () => hideModal(confirmModal);

  confirmDeleteBtn.onclick = async () => {
    const t = teachers[teacherToDeleteIndex];
    await fetch(`${TEACHER_API_URL}/${t.id}`, { method: "DELETE" });
    hideModal(confirmModal);
    loadTeachers();
  };

  function openView(i) {
    const t = teachers[i];

    document.getElementById("viewTeacherId").textContent = t.teacherid;
    document.getElementById("viewName").textContent =
      `${t.firstname} ${t.middlename || ""} ${t.lastname}`;
    document.getElementById("viewGender").textContent = t.gender;
    document.getElementById("viewDob").textContent = formatDateForInput(t.dob);
    document.getElementById("viewHd").textContent = formatDateForInput(t.hd);
    document.getElementById("viewEmail").textContent = t.email;
    document.getElementById("viewContact").textContent = t.contactnumber;
    document.getElementById("viewAddress").textContent = t.address;
    document.getElementById("viewSalary").textContent = t.salary;
    document.getElementById("viewUsername").textContent = t.username;
    document.getElementById("viewPassword").textContent = t.password;

    showModal(viewModal);
  }

  closeViewBtn.onclick = () => hideModal(viewModal);

  // VALIDATION OF INPUT OF THE TEACHER ID AND CONTACT NUMBER
  teacherIdInput.addEventListener("input", async () => {
    const teacherId = teacherIdInput.value.toUpperCase();
    teacherIdInput.value = teacherId.replace(/[^A-Z0-9]/g, "").slice(0, 10);

    if (teacherIdInput.value.length > 0) {
      try {
        const res = await fetch(`http://localhost:3000/check-teacherid/${teacherIdInput.value}`);
        const { exists } = await res.json();
        if (exists) {
          alert("Teacher ID already exists!");
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

  contactNumberInput.addEventListener("input", () => {
    contactNumberInput.value = contactNumberInput.value.replace(/\D/g, "").slice(0, 11);
  });

  function showModal(modal) {
    modal.classList.add("active");
  }

  function hideModal(modal) {
    modal.classList.remove("active");
  }

  logoutBtn.onclick = () => logoutModal.style.display = "flex";
  cancelLogoutBtn.onclick = () => logoutModal.style.display = "none";
  confirmLogoutBtn.onclick = () => window.location.href = "login.html";

  loadTeachers();
});
