document.addEventListener("DOMContentLoaded", () => {

  // VERIFY THE LOGIN TEACHER
  const teacherId = localStorage.getItem("teacherId");
  if (!teacherId) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  // TABLE, BUTTONS, MODAL AND LOGOUT
  const sectionTableBody = document.getElementById("sectionTableBody");
  const studentTableBody = document.getElementById("studentTableBody");
  const markingSheetView = document.getElementById("markingSheetView");
  const sectionSelectionView = document.getElementById("sectionSelectionView");
  const attendTitle = document.getElementById("attendTitle");
  const submitBtn = document.getElementById("submitBtn");
  const backBtn = document.getElementById("backBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  // DISPLAY CURRENT DATE
  document.getElementById("currentDateDisplay").textContent =
    new Date().toLocaleDateString();

  let attendanceData = {};
  let currentSectionId = null;
  let currentSubjectId = null;
  let currentSectionRow = null;

  // LOAD SECTIONS WITH SUBJECTS
  fetch(`http://localhost:3000/teacher/${teacherId}/grade-info/attendance`)
    .then(res => res.json())
    .then(sections => {
      if (!Array.isArray(sections) || sections.length === 0) {
        sectionTableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center">No assigned classes</td>
          </tr>`;
        return;
      }

      sectionTableBody.innerHTML = "";
      sections.forEach(sec => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${sec.gradeName} - ${sec.sectionName}</td>
          <td>${sec.subjectName} (${sec.schedule || "-"})</td>
          <td>${sec.adviser || "-"}</td>
          <td class="text-center total-cell">${sec.totalStudents}</td>
          <td class="text-center">
            <button class="btn-select" data-section="${sec.sectionId}" data-subject="${sec.subjectId}">
              Mark Attendance
            </button>
          </td>
        `;
        sectionTableBody.appendChild(tr);
      });
    })
    .catch(err => console.error("Failed to load sections:", err));

  // LOAD STUDENTS FOR THE ATTENDANCE CHECKING
  sectionTableBody.addEventListener("click", e => {
    const btn = e.target.closest(".btn-select");
    if (!btn) return;

    currentSectionId = Number(btn.dataset.section);
    currentSubjectId = Number(btn.dataset.subject);
    currentSectionRow = btn.closest("tr");

    attendTitle.textContent = currentSectionRow.children[0].textContent + " - " +
      currentSectionRow.children[1].textContent;

    sectionSelectionView.classList.add("hidden");
    markingSheetView.classList.remove("hidden");

    attendanceData = {};
    studentTableBody.innerHTML = "";

    fetch(`http://localhost:3000/section-students/${currentSectionId}`)
      .then(res => res.json())
      .then(students => {
        const validStudents = students.filter(s => s.student_id || s.studentId);
        currentSectionRow.querySelector(".total-cell").textContent = validStudents.length;

        validStudents
          .sort((a, b) => a.lastname.localeCompare(b.lastname))
          .forEach((stu, index) => {
            const studentId = stu.student_id ?? stu.studentId;

            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${index + 1}</td>
              <td>${stu.lastname}, ${stu.firstname} ${stu.middlename || ""}</td>
              <td>${stu.gender}</td>
              <td class="text-center">
                <div class="attendance-options">
                  <button class="btn-attend present" title="Present">
                    <i class="fas fa-check"></i>
                  </button>
                  <button class="btn-attend absent" title="Absent">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </td>
            `;

            studentTableBody.appendChild(tr);

            const presentBtn = tr.querySelector(".present");
            const absentBtn = tr.querySelector(".absent");

            presentBtn.addEventListener("click", () =>
              setAttendance(studentId, "Present", tr)
            );

            absentBtn.addEventListener("click", () =>
              setAttendance(studentId, "Absent", tr)
            );
          });
      });
  });

  // ATTENDANCE BUTTON FUNCTION
  function setAttendance(studentId, status, row) {
    attendanceData[studentId] = status;

    row.querySelectorAll(".btn-attend").forEach(btn => btn.classList.remove("active"));
    row.querySelector(status === "Present" ? ".present" : ".absent").classList.add("active");
  }

  // SUBMIT ATTENDANCE BUTTON
  submitBtn.addEventListener("click", () => {
    const totalStudents = document.querySelectorAll("#studentTableBody tr").length;

    if (Object.keys(attendanceData).length !== totalStudents) {
      alert("Please mark ALL students before submitting.");
      return;
    }

    const records = Object.keys(attendanceData).map(id => ({
      studentId: Number(id),
      sectionId: currentSectionId,
      subjectId: currentSubjectId,
      status: attendanceData[id]
    }));

    fetch("http://localhost:3000/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(records)
    })
      .then(() => {
        alert("Attendance submitted successfully!");
      })
      .catch(err => {
        console.error("Error submitting attendance:", err);
        alert("Failed to submit attendance.");
      });
  });

  backBtn.addEventListener("click", () => {
    markingSheetView.classList.add("hidden");
    sectionSelectionView.classList.remove("hidden");
  });

  logoutBtn.addEventListener("click", () => {
    logoutModal.style.display = "flex";
  });

  cancelLogoutBtn.addEventListener("click", () => {
    logoutModal.style.display = "none";
  });

  confirmLogoutBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });

});
