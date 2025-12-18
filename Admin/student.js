document.addEventListener("DOMContentLoaded", () => {
  // API FOR THE STUDENT
  const API_URL = "http://localhost:3000/students";
  let students = [];

  // TABLE, SEARCH, BUTTONS, VIEW, ADD, DELETE AND LOGOUT MODAL
  const studentTableBody = document.getElementById("studentTableBody");
  const addStudentBtn = document.querySelector(".btn-add");
  const searchInput = document.getElementById("studentSearch");
  const formModal = document.getElementById("addStudentModal");
  const studentForm = document.getElementById("addStudentForm");
  const cancelFormBtn = document.getElementById("cancelAddBtn");
  const confirmModal = document.getElementById("confirmModal");
  const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const confirmMessage = document.getElementById("confirmMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  // INPUTS OF THE USER
  const firstNameInput = document.getElementById("firstName");
  const middleNameInput = document.getElementById("middleName");
  const lastNameInput = document.getElementById("lastName");
  const genderInput = document.getElementById("gender");
  const dobInput = document.getElementById("dob");
  const gradeLevelInput = document.getElementById("gradeLevel");
  const lrnInput = document.getElementById("lrn");
  const parentNameInput = document.getElementById("parentName");
  const contactNumberInput = document.getElementById("contactNum");
  const addressInput = document.getElementById("address");
  
  let studentToDeleteId = null;
  let editIndex = null;

  // LOAD ALL THE STUDENTS
  async function loadStudents() {
    try {
      const res = await fetch(API_URL);
      students = await res.json();

      students.sort((a, b) => Number(a.lrn) - Number(b.lrn));
      renderTable(students);
    } catch (err) {
      alert("Failed to load students");
    }
  }

  // RENDER THE TABLE
  function renderTable(list) {
    studentTableBody.innerHTML = "";

    if (!list.length) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;">No results found</td>
        </tr>
      `;
      return;
    }

    list.forEach((student, i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${student.lrn}</td>
        <td>${student.firstname} ${student.middlename || ""} ${student.lastname}</td>
        <td>${student.gender}</td>
        <td>${student.gradelevel}</td>
        <td>${student.contactnumber}</td>
        <td>
          <button class="icon-btn view"><i class="fas fa-eye"></i></button>
          <button class="icon-btn edit"><i class="fas fa-edit"></i></button>
          <button class="icon-btn delete"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;

      const [viewBtn, editBtn, deleteBtn] = tr.querySelectorAll("button");

      viewBtn.onclick = () => {
        window.location.href = `studentrecord.html?id=${student.id}`;
      };

      editBtn.onclick = () => openEditModal(student);
      deleteBtn.onclick = () => openConfirmModal(student);

      studentTableBody.appendChild(tr);
    });
  }

  // SEARCH THE NAME OF THE STUDENT
  searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.trim().toLowerCase();

      const filtered = students.filter(s => {
      const fullName = `${s.firstname} ${s.middlename || ""} ${s.lastname}`.toLowerCase();
      const lrn = String(s.lrn);

      return fullName.includes(keyword) || lrn.includes(keyword);
    });

    renderTable(filtered);
  });

    addStudentBtn.onclick = () => {
    studentForm.reset();
    editIndex = null;
    showModal(formModal);
  };

  cancelFormBtn.onclick = () => hideModal(formModal);

  studentForm.addEventListener("submit", async e => {
    e.preventDefault();

    if (lrnInput.value.length !== 12) {
      alert("LRN must be exactly 12 digits.");
      return;
    }

    if (contactNumberInput.value.length !== 11) {
      alert("Contact number must be exactly 11 digits.");
      return;
    }

    const data = {
      firstname: firstNameInput.value.trim(),
      middlename: middleNameInput.value.trim(),
      lastname: lastNameInput.value.trim(),
      gender: genderInput.value,
      dob: dobInput.value,
      gradelevel: gradeLevelInput.value,
      lrn: lrnInput.value,
      parentname: parentNameInput.value.trim(),
      contactnumber: contactNumberInput.value,
      address: addressInput.value.trim()
    };

    try {
      if (editIndex === null) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        await fetch(`${API_URL}/${editIndex}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      }

      hideModal(formModal);
      loadStudents();
    } catch {
      alert("Failed to save student");
    }
  });

  function openEditModal(student) {
    editIndex = student.id;

    firstNameInput.value = student.firstname;
    middleNameInput.value = student.middlename || "";
    lastNameInput.value = student.lastname;
    genderInput.value = student.gender;
    dobInput.value = student.dob?.split("T")[0] || "";
    gradeLevelInput.value = student.gradelevel;
    lrnInput.value = student.lrn;
    parentNameInput.value = student.parentname;
    contactNumberInput.value = student.contactnumber;
    addressInput.value = student.address;

    showModal(formModal);
  }

  function openConfirmModal(student) {
    studentToDeleteId = student.id;
    confirmMessage.textContent = `Delete ${student.firstname} ${student.lastname}?`;
    showModal(confirmModal);
  }

  cancelConfirmBtn.onclick = () => hideModal(confirmModal);

  confirmDeleteBtn.onclick = async () => {
    await fetch(`${API_URL}/${studentToDeleteId}`, { method: "DELETE" });
    hideModal(confirmModal);
    loadStudents();
  };

  // VALIDATION OF INPUT OF LRN AND CONTACT NUMBER
    lrnInput.addEventListener("input", () => {
      lrnInput.value = lrnInput.value.replace(/\D/g, "").slice(0, 12);
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

  loadStudents();
});