document.addEventListener("DOMContentLoaded", () => {

  // TABLE, SEARCH, BUTTONS, VIEW, ADD, DELETE AND LOGOUT MODAL
  const headerTitle = document.getElementById("headerTitle");
  const tableBody = document.getElementById("tableBody");
  const tableHeader = document.getElementById("tableHeader");
  const backBtn = document.getElementById("backBtn");
  const addBtn = document.getElementById("addBtn");
  const addSubjectModal = document.getElementById("addSubjectModal");
  const cancelAddSubject = document.getElementById("cancelAddSubject");
  const saveSubjectBtn = document.getElementById("saveSubjectBtn");
  const editSubjectModal = document.getElementById("editSubjectModal");
  const cancelEditSubject = document.getElementById("cancelEditSubject");
  const saveEditSubjectBtn = document.getElementById("saveEditSubjectBtn");
  const deleteModal = document.getElementById("deleteSectionModal");
  const deleteMessage = document.getElementById("deleteMessage");
  const cancelDeleteBtn = document.getElementById("cancelDeleteSection");
  const confirmDeleteBtn = document.getElementById("confirmDeleteSection");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  // INPUT BYY THE USER
  const subject_name = document.getElementById("subject_name");
  const teacherSelect = document.getElementById("teacherSelect");
  const school_year = document.getElementById("school_year");
  const time = document.getElementById("time");
  const edit_subject_name = document.getElementById("edit_subject_name");
  const edit_teacherSelect = document.getElementById("edit_teacherSelect");
  const edit_school_year = document.getElementById("edit_school_year");
  const edit_time = document.getElementById("edit_time");

  let currentView = "grades";
  let currentGradeId = null;
  let currentGradeName = "";
  let currentSectionId = null;
  let currentSectionName = "";
  let selectedSubjectId = null;

  // CHECK THE TIME FOR OVERLAP
  function isTimeOverlap(newTime, existingTimes) {
    if (!newTime || !newTime.includes("-")) return false;

    const [ns, ne] = newTime.split("-").map(t => t.trim());
    const [nsh, nsm] = ns.split(":").map(Number);
    const [neh, nem] = ne.split(":").map(Number);

    const newStart = nsh * 60 + nsm;
    const newEnd = neh * 60 + nem;

    return existingTimes.some(t => {
      if (!t || !t.includes("-")) return false;
      const [s, e] = t.split("-").map(x => x.trim());
      const [sh, sm] = s.split(":").map(Number);
      const [eh, em] = e.split(":").map(Number);
      return newStart < (eh * 60 + em) && newEnd > (sh * 60 + sm);
    });
  }

  // LOAD THE AVAILABLE GRADES
  function loadGrades() {
    currentView = "grades";
    currentGradeId = null;
    currentSectionId = null;

    headerTitle.textContent = "GRADE LEVELS";
    tableHeader.innerHTML = "<th>Grade Level</th><th>Action</th>";
    tableBody.innerHTML = "";
    backBtn.style.display = "none";
    addBtn.style.display = "none";

    fetch("http://localhost:3000/grade-levels")
      .then(res => res.json())
      .then(grades => {
        if (grades.length === 0) {
          tableBody.innerHTML = `
          <tr><td colspan="2" style="text-align:center">No grade levels available</td></tr>`;
          return;
        }
        grades.forEach(g => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${g.name}</td>
            <td><button class="btn-select">Select</button></td>
          `;
          tr.querySelector("button").onclick = () => loadSections(g.id, g.name);
          tableBody.appendChild(tr);
        });
      });
  }

  // LOAD THE AVAILABLE SECTION
  function loadSections(gradeId, gradeName) {
    currentView = "sections";
    currentGradeId = gradeId;
    currentGradeName = gradeName;

    headerTitle.textContent = `${gradeName} Sections`;
    tableHeader.innerHTML = "<th>Section</th><th>Adviser</th><th>Action</th>";
    tableBody.innerHTML = "";
    backBtn.style.display = "inline-block";
    addBtn.style.display = "none";

    fetch(`http://localhost:3000/sections/${gradeId}`)
      .then(res => res.json())
      .then(sections => {
        if (sections.length === 0) {
          tableBody.innerHTML = `
          <tr><td colspan="3" style="text-align:center">No sections available</td></tr>`;
          return;
        }
        sections.forEach(s => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.teacher_name}</td>
            <td><button class="btn-select">Manage</button></td>
          `;
          tr.querySelector("button").onclick = () => loadSubjects(s.id, s.name);
          tableBody.appendChild(tr);
        });
      });
  }

  // LOAD THE AVAILABLE SUBJECTS
  function loadSubjects(sectionId, sectionName) {
    currentView = "subjects";
    currentSectionId = sectionId;
    currentSectionName = sectionName;

    headerTitle.textContent = `${sectionName} Subjects`;
    tableHeader.innerHTML =
      "<th>Name</th><th>Teacher</th><th>Year</th><th>Time</th><th>Action</th>";
    tableBody.innerHTML = "";
    backBtn.style.display = "inline-block";
    addBtn.style.display = "inline-block";

    fetch(`http://localhost:3000/subjects/${sectionId}`)
      .then(res => res.json())
      .then(subjects => {
        if (subjects.length === 0) {
          tableBody.innerHTML = `
          <tr><td colspan="5" style="text-align:center">No subjects available</td></tr>`;
          return;
        }
        subjects.forEach(sub => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${sub.subject_name}</td>
            <td>${sub.teacher_name}</td>
            <td>${sub.school_year}</td>
            <td>${sub.time}</td>
            <td>
              <button class="icon-btn edit"><i class="fas fa-edit"></i></button>
              <button class="icon-btn delete"><i class="fas fa-trash-alt"></i></button>
            </td>
          `;

          tr.querySelector(".edit").onclick = () => {
            selectedSubjectId = sub.id;
            edit_subject_name.value = sub.subject_name;
            edit_school_year.value = sub.school_year;
            edit_time.value = sub.time;
            loadTeachers(edit_teacherSelect);
            edit_teacherSelect.value = sub.teacher_id;
            editSubjectModal.style.display = "flex";
          };

          tr.querySelector(".delete").onclick = () => {
            selectedSubjectId = sub.id;
            deleteMessage.textContent = `Delete "${sub.subject_name}"?`;
            deleteModal.style.display = "flex";
          };

          tableBody.appendChild(tr);
        });
      });
  }

  // LOAD THE TEACHER FOR SELECTING A ATEACHER
  function loadTeachers(select) {
    select.innerHTML = `<option disabled selected>Select Teacher</option>`;
    fetch("http://localhost:3000/teachers")
      .then(res => res.json())
      .then(ts => {
        ts.forEach(t => {
          const opt = document.createElement("option");
          opt.value = t.id;
          opt.textContent = `${t.firstname} ${t.lastname}`;
          select.appendChild(opt);
        });
      });
  }

  addBtn.onclick = () => {
    loadTeachers(teacherSelect);
    subject_name.value = "";
    school_year.value = "";
    time.value = "";
    addSubjectModal.style.display = "flex";
  };

  saveSubjectBtn.onclick = () => {
    fetch(`http://localhost:3000/subjects/${currentSectionId}`)
      .then(res => res.json())
      .then(list => {
        if (isTimeOverlap(time.value, list.map(s => s.time)))
          return alert("Time overlap!");

        fetch("http://localhost:3000/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject_name: subject_name.value,
            teacher_id: teacherSelect.value,
            school_year: school_year.value,
            time: time.value,
            section_id: currentSectionId
          })
        }).then(() => {
          addSubjectModal.style.display = "none";
          loadSubjects(currentSectionId, currentSectionName);
        });
      });
  };

  saveEditSubjectBtn.onclick = () => {
    fetch(`http://localhost:3000/subjects/${currentSectionId}`)
      .then(res => res.json())
      .then(list => {
        const others = list.filter(s => s.id !== selectedSubjectId).map(s => s.time);
        if (isTimeOverlap(edit_time.value, others))
          return alert("Time overlap!");

        fetch(`http://localhost:3000/subjects/${selectedSubjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject_name: edit_subject_name.value,
            teacher_id: edit_teacherSelect.value,
            school_year: edit_school_year.value,
            time: edit_time.value
          })
        }).then(() => {
          editSubjectModal.style.display = "none";
          loadSubjects(currentSectionId, currentSectionName);
        });
      });
  };

  confirmDeleteBtn.onclick = () => {
    fetch(`http://localhost:3000/subjects/${selectedSubjectId}`, { method: "DELETE" })
      .then(() => {
        deleteModal.style.display = "none";
        loadSubjects(currentSectionId, currentSectionName);
      });
  };

  cancelAddSubject.onclick = () => addSubjectModal.style.display = "none";
  cancelEditSubject.onclick = () => editSubjectModal.style.display = "none";
  cancelDeleteBtn.onclick = () => deleteModal.style.display = "none";

  backBtn.onclick = () => {
    if (currentView === "subjects") {
      loadSections(currentGradeId, currentGradeName);
    } else if (currentView === "sections") {
      loadGrades();
    }
  };

  if (logoutBtn) logoutBtn.onclick = () => logoutModal.style.display = "flex";
  if (cancelLogoutBtn) cancelLogoutBtn.onclick = () => logoutModal.style.display = "none";
  if (confirmLogoutBtn) confirmLogoutBtn.onclick = () => window.location.href = "login.html";

  loadGrades();
});
