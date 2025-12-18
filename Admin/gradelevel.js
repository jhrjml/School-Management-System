document.addEventListener("DOMContentLoaded", () => {
  // THE API FOR GRADE LEVELS
  const API_URL = "http://localhost:3000/grade-levels";
  let grades = [];

  // TABLE, BUTTONS, VIEW, ADD, DELETE AND LOGOUT MODAL
  const addGradeBtn = document.querySelector(".btn-add");
  const addModal = document.getElementById("addGradeModal");
  const cancelAddBtn = document.getElementById("cancelAddBtn");
  const addGradeForm = document.getElementById("addGradeForm");
  const gradeTableBody = document.getElementById("gradeTableBody");
  const deleteGradeModal = document.getElementById("deleteGradeModal");
  const deleteGradeText = document.getElementById("deleteGradeText");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  // GRADE LEVEL NAME INPUT
  const gradeNameInput = document.getElementById("gradeName");

  let editId = null;
  let deleteId = null;

  // LOAD THE AVAILABLE GRADE LEVEL
  async function loadGrades() {
    try {
      const res = await fetch(API_URL);
      grades = await res.json();
      renderGradeTable();
    } catch (err) {
      console.error("Error loading grades:", err);
    }
  }

  // RENDER THE TABLE
  function renderGradeTable() {
    gradeTableBody.innerHTML = "";

    grades.sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, ""), 10);
      const numB = parseInt(b.name.replace(/\D/g, ""), 10);
      return numA - numB;
    });

    grades.forEach((g) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${g.name}</td>
        <td>
          <button class="icon-btn edit" data-id="${g.id}"><i class="fas fa-edit"></i></button>
          <button class="icon-btn delete" data-id="${g.id}"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      gradeTableBody.appendChild(tr);
    });

    addTableListeners();
  }

  // ACTION BUTTON LISTENERS
  function addTableListeners() {
    document.querySelectorAll(".icon-btn.edit").forEach((btn) => {
      btn.onclick = () => openEditGrade(btn.dataset.id);
    });

    document.querySelectorAll(".icon-btn.delete").forEach((btn) => {
      const grade = grades.find((g) => g.id == btn.dataset.id);
      btn.onclick = () => openDeleteGrade(btn.dataset.id, grade.name);
    });
  }

  addGradeBtn.onclick = () => {
    editId = null;
    gradeNameInput.value = "";
    addModal.classList.add("active");
  };

  cancelAddBtn.onclick = () => addModal.classList.remove("active");

  addGradeForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = gradeNameInput.value.trim();
    if (!name) return;

    try {
      if (editId) {
        await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      }

      loadGrades();
      addModal.classList.remove("active");
    } catch (err) {
      console.error("Error saving grade:", err);
    }
  };

  function openEditGrade(id) {
    const grade = grades.find((g) => g.id == id);
    if (!grade) return;
    editId = id;
    gradeNameInput.value = grade.name;
    addModal.classList.add("active");
  }

  function openDeleteGrade(id, name) {
    deleteId = id;
    deleteGradeText.textContent = `Are you sure you want to delete "${name}"?`;
    deleteGradeModal.classList.add("active");
  }

  cancelDeleteBtn.onclick = () => {
    deleteId = null;
    deleteGradeModal.classList.remove("active");
  };

  confirmDeleteBtn.onclick = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API_URL}/${deleteId}`, { method: "DELETE" });
      loadGrades();
      deleteGradeModal.classList.remove("active");
      deleteId = null;
    } catch (err) {
      console.error("Error deleting grade:", err);
    }
  };

  logoutBtn.onclick = () => logoutModal.classList.add("active");
  cancelLogoutBtn.onclick = () => logoutModal.classList.remove("active");
  confirmLogoutBtn.onclick = () => (window.location.href = "login.html");

  loadGrades();
});