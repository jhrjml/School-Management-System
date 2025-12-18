document.addEventListener("DOMContentLoaded", () => { 
  
  // TABLE, BUTTONS, VIEW, ADD, DELETE AND LOGOUT MODAL
  const gradeSelectionView = document.getElementById("gradeSelectionView");
  const sectionListView = document.getElementById("sectionListView");
  const studentListView = document.getElementById("studentListView");
  const selectedGradeTitle = document.getElementById("selectedGradeTitle");
  const selectedSectionTitle = document.getElementById("selectedSectionTitle");
  const sectionTableBody = document.getElementById("sectionTableBody");
  const studentListBody = document.getElementById("studentListBody");
  const btnAddSection = document.getElementById("btnAddSection");
  const btnAddStudentToSection = document.getElementById("btnAddStudentToSection");
  const addSectionModal = document.getElementById("addSectionModal");
  const addSectionForm = document.getElementById("addSectionForm");
  const closeSectionModalBtns = addSectionModal?.querySelectorAll(".close-modal");
  const addStudentModal = document.getElementById("addStudentModal");
  const addStudentForm = document.getElementById("addStudentForm");
  const closeStudentModalBtns = addStudentModal?.querySelectorAll(".close-modal");
  const btnBackToGrades = document.getElementById("btnBackToGrades");
  const btnBackToSections = document.getElementById("btnBackToSections");
  const confirmModal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  // INPUT BY THE USER
  const sectionNameInput = document.getElementById("sectionName");
  const adviserSelect = document.getElementById("adviserSelect");
  const gradeLevelDisplay = document.getElementById("gradeLevelDisplay");
  const studentDropdown = document.getElementById("studentDropdown");
  const newStudentLRN = document.getElementById("newStudentLRN");
  const newStudentGender = document.getElementById("newStudentGender");
  const sectionDisplay = document.getElementById("sectionDisplay");
  
  let deleteCallback = null;

  // ACTION BUTTON LISTENER
  cancelConfirmBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
    deleteCallback = null;
  });

  confirmDeleteBtn.addEventListener("click", () => {
    if (deleteCallback) deleteCallback();
    confirmModal.style.display = "none";
    deleteCallback = null;
  });

  btnBackToGrades.addEventListener("click", () => {
    gradeSelectionView.classList.remove("hidden");
    sectionListView.classList.add("hidden");
  });

  btnBackToSections.addEventListener("click", () => {
    sectionListView.classList.remove("hidden");
    studentListView.classList.add("hidden");
  });

  function showConfirmModal(message, callback) {
    confirmMessage.textContent = message;
    deleteCallback = callback;
    confirmModal.style.display = "flex";
  }

  // LOAD THE AVAILABLE GRADE LEVEL
  function loadGrades() {
    gradeSelectionView.classList.remove("hidden");
    sectionListView.classList.add("hidden");
    studentListView.classList.add("hidden");

    const tbody = gradeSelectionView.querySelector("tbody");
    tbody.innerHTML = "";

    fetch("http://localhost:3000/grade-levels")
      .then(res => res.json())
      .then(grades => {
        grades.sort((a, b) => {
          const numA = parseInt(a.name.replace(/\D/g, ""));
          const numB = parseInt(b.name.replace(/\D/g, ""));
          return numA - numB;
        });
        if (!grades.length) {
        tbody.innerHTML = `
        <tr><td colspan="2" style="text-align:center">No grade levels available. Please add a grade level first.</td></tr>`;
        return;
      }

        grades.forEach(grade => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${grade.name}</td>
            <td>
              <button class="btn-select">Manage Sections</button>
            </td>
          `;
          tr.querySelector(".btn-select").addEventListener("click", () => {
            loadSections(grade.id, grade.name);
          });
          tbody.appendChild(tr);
        });
      });
  }

  // LOAD THE AVAILABLE SECTION
  async function loadSections(gradeId, gradeName){
    currentGradeId = gradeId;
    gradeSelectionView.classList.add("hidden");
    sectionListView.classList.remove("hidden");
    studentListView.classList.add("hidden");

    selectedGradeTitle.textContent = `${gradeName} Sections`;
    sectionTableBody.innerHTML = "";

  try {
    const sections = await fetch(`http://localhost:3000/sections/${gradeId}`).then(res=>res.json());

    if(!sections.length){
      sectionTableBody.innerHTML = `<tr><td colspan="4">No sections available.</td></tr>`;
      return;
    }

    for (const sec of sections) {
      const studentCountRes = await fetch(`http://localhost:3000/section-students/${sec.id}`);
      const students = await studentCountRes.json();
      const population = students.length;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sec.name}</td>
        <td>${sec.teacher_name || "Unassigned"}</td>
        <td>${population} Students</td>
        <td>
          <button class="icon-btn view" title="View"><i class="fas fa-eye"></i></button>
          <button class="icon-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="icon-btn delete" title="Delete"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      tr.querySelector(".view").addEventListener("click", ()=>loadStudents(sec.id, sec.name));
      tr.querySelector(".edit").addEventListener("click", ()=>openSectionModal(sec));
      tr.querySelector(".delete").addEventListener("click", ()=>deleteSection(sec));
      sectionTableBody.appendChild(tr);
    }

  } catch (err) {
    console.error("Error loading sections:", err);
    sectionTableBody.innerHTML = `<tr><td colspan="4">Failed to load sections.</td></tr>`;
  }
}


  // LOAD THE STUDENT INSIDE THE SECTION
  function loadStudents(sectionId, sectionName){
    currentSectionId = sectionId;
    gradeSelectionView.classList.add("hidden");
    sectionListView.classList.add("hidden");
    studentListView.classList.remove("hidden");

    selectedSectionTitle.textContent = `Section: ${sectionName}`;
    studentListBody.innerHTML = "";

    fetch(`http://localhost:3000/section-students/${sectionId}`)
      .then(res=>res.json())
      .then(students=>{
        students.sort((a, b) => 
        a.lastname.localeCompare(b.lastname)
  );

        if(!students.length){
          studentListBody.innerHTML = `<tr><td colspan="5">No students.</td></tr>`;
          return;
        }

        students.forEach(s=>{
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${s.lrn}</td>
            <td>${s.lastname}, ${s.firstname}</td>
            <td>${s.gender}</td>
            <td>Enrolled</td>
            <td><button class="icon-btn delete" title="Remove"><i class="fas fa-trash-alt"></i></button></td>
          `;
          tr.querySelector(".delete").addEventListener("click", ()=>deleteStudent(s));
          studentListBody.appendChild(tr);
        });
      });
  }

  btnAddSection.addEventListener("click", ()=>openSectionModal());
  btnAddStudentToSection.addEventListener("click", openStudentModal);
  
  async function openSectionModal(section = null) {
    currentSectionId = section ? section.id : null;
    sectionNameInput.value = section ? section.name : "";
    adviserSelect.innerHTML = `<option value="">Select Teacher</option>`;

    const allAdvisers = await fetch("http://localhost:3000/teachers").then(r => r.json());
    const assignedSections = await fetch("http://localhost:3000/all-sections").then(r => r.json());

    const availableAdvisers = allAdvisers.filter(t => {
      if (section && t.id === section.teacher_id) return true;
      return !assignedSections.some(sec => sec.teacher_id === t.id);
    });

    availableAdvisers.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.firstname} ${t.lastname}`;
      if (section && section.teacher_id === t.id) opt.selected = true;
      adviserSelect.appendChild(opt);
    });

    gradeLevelDisplay.value = selectedGradeTitle.textContent.replace(" Sections", "");
    addSectionModal.style.display = "flex";
  }

  async function openStudentModal(){
    studentDropdown.innerHTML = `<option value="">Select Student</option>`;
    newStudentLRN.value = "";
    newStudentGender.value = "Male";
    sectionDisplay.value = selectedSectionTitle.textContent.replace("Section: ","");

    const allStudents = await fetch("http://localhost:3000/all-students").then(r=>r.json());
    const assignedStudents = await fetch("http://localhost:3000/all-section-students").then(r=>r.json());

    const gradeName = selectedGradeTitle.textContent.replace(" Sections","");
    const availableStudents = allStudents.filter(s => {
      return s.gradelevel === gradeName && !assignedStudents.some(a => a.studentId === s.id);
    });

    availableStudents.forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.firstname} ${s.lastname}`;
      studentDropdown.appendChild(opt);
    });

    studentDropdown.addEventListener("change", ()=>{
      const selectedId = studentDropdown.value;
      const selectedStudent = allStudents.find(s => s.id == selectedId);
      newStudentLRN.value = selectedStudent ? selectedStudent.lrn : "";
    });

    addStudentModal.style.display = "flex";
  }

  closeSectionModalBtns.forEach(btn=>btn.addEventListener("click",()=>addSectionModal.style.display="none"));
  closeStudentModalBtns.forEach(btn=>btn.addEventListener("click",()=>addStudentModal.style.display="none"));

  addSectionForm.addEventListener("submit", e=>{
    e.preventDefault();
    const teacherId = adviserSelect.value ? Number(adviserSelect.value) : null;
    const payload = { 
      name: sectionNameInput.value.trim(), 
      gradeId: currentGradeId, 
      teacher_id: teacherId
    };
    const url = currentSectionId ? `http://localhost:3000/sections/${currentSectionId}` : "http://localhost:3000/sections";
    const method = currentSectionId ? "PUT" : "POST";
    fetch(url, { method, 
      headers:{"Content-Type":"application/json"}, 
      body: JSON.stringify(payload)
    })
      .then(res=>res.json())
      .then(()=>{ addSectionModal.style.display="none"; 
      loadSections(currentGradeId, gradeLevelDisplay.value)
    })
      .catch(err=>alert(err.message));
  });

  addStudentForm.addEventListener("submit", e=>{
    e.preventDefault();
    const studentId = Number(studentDropdown.value);
    if(!studentId) return alert("Please select a student");

    fetch("http://localhost:3000/section-students", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ studentId, sectionId: currentSectionId })
    })
    .then(res => res.json())
    .then(()=> {
      addStudentModal.style.display = "none";
      loadStudents(currentSectionId, selectedSectionTitle.textContent.replace("Section: ",""));
    })
    .catch(err => alert(err.message));
  });

  function deleteSection(section){
    showConfirmModal(`Are you sure you want to delete section "${section.name}"?`, () => {
      fetch(`http://localhost:3000/sections/${section.id}`, {method:"DELETE"})
        .then(()=>loadSections(currentGradeId, gradeLevelDisplay.value))
        .catch(err => alert(err.message));
    });
  }

  function deleteStudent(student){
    showConfirmModal(`Are you sure you want to remove student "${student.firstname} ${student.lastname}"?`, () => {
      fetch(`http://localhost:3000/section-students/delete`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ studentId: student.student_id, sectionId: currentSectionId })
      })
      .then(()=>loadStudents(currentSectionId, selectedSectionTitle.textContent.replace("Section: ","")))
      .catch(err => alert(err.message));
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logoutModal.style.display = "flex";
    });
  }

  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener("click", () => {
      logoutModal.style.display = "none";
    });
  }

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  loadGrades();
});
