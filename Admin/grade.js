document.addEventListener("DOMContentLoaded", () => {

  // VERIFYING TEACHER LOGIN
  const teacherId = localStorage.getItem("teacherId");
  if (!teacherId) {
    alert("Session expired or not logged in. Please login.");
    window.location.href = "login.html";
    return;
  }

  // TABLE, BUTTONS, MODAL AND LOGOUT
  const sectionTableBody = document.getElementById("sectionTableBody");
  const sectionSelectionView = document.getElementById("sectionSelectionView");
  const gradingSheetView = document.getElementById("gradingSheetView");
  const gradeSheetTitle = document.getElementById("gradeSheetTitle");
  const gradeSheetSubject = document.getElementById("gradeSheetSubject");
  const gradingTableBody = document.getElementById("gradingTableBody");
  const backBtn = document.getElementById("backBtn");
  const saveGradesBtn = document.getElementById("saveGradesBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

  // LOAD THE SECTIONS AND SUBJECTS
  fetch(`http://localhost:3000/teacher/${teacherId}/grade-info/grades`)

    .then(res => res.json())
    .then(data => {

      if (!Array.isArray(data) || data.length === 0) {
        sectionTableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center">No assigned classes</td>
          </tr>`;
        return;
      }

      sectionTableBody.innerHTML = "";

      data.forEach(row => {
        const tr = document.createElement("tr");
        const sectionDisplay = `${row.gradeName} - ${row.sectionName}`;
        const schedule = row.schedule || "—";

        tr.innerHTML = `
          <td>${sectionDisplay}</td>
          <td>${row.subjectName}</td>
          <td>${schedule}</td>
          <td style="text-align:center">
            <button class="icon-btn view" title="View">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        `;

        tr.querySelector(".view").addEventListener("click", () => {
          openGradeSheet(row);
        });

        sectionTableBody.appendChild(tr);
      });
    })
    .catch(err => console.error("Failed to load sections:", err));

  // GRADE INPUT
  function openGradeSheet({ sectionId, sectionName, subjectId, subjectName, gradeName }) {

    sectionSelectionView.classList.add("hidden");
    gradingSheetView.classList.remove("hidden");
    gradeSheetTitle.textContent = `${gradeName} - ${sectionName}`;
    gradeSheetSubject.textContent = subjectName;

    fetch(`http://localhost:3000/section-students/${sectionId}`)
      .then(res => res.json())
      .then(students => {

        gradingTableBody.innerHTML = "";

        students
          .sort((a, b) => a.lastname.localeCompare(b.lastname))
          .forEach(student => {
        
        const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${student.lastname}, ${student.firstname} ${student.middlename || ""}</td>
            <td><input type="number" class="q1 grade-input" min="0" max="100"></td>
            <td><input type="number" class="q2 grade-input" min="0" max="100"></td>
            <td><input type="number" class="q3 grade-input" min="0" max="100"></td>
            <td><input type="number" class="q4 grade-input" min="0" max="100"></td>
            <td class="final-grade">—</td>
          `;

          gradingTableBody.appendChild(tr);

          const inputs = tr.querySelectorAll("input");
          const finalCell = tr.querySelector(".final-grade");

          inputs.forEach(() => {
            tr.addEventListener("input", () => {
              const q1 = +tr.querySelector(".q1").value || 0;
              const q2 = +tr.querySelector(".q2").value || 0;
              const q3 = +tr.querySelector(".q3").value || 0;
              const q4 = +tr.querySelector(".q4").value || 0;
              finalCell.textContent = ((q1 + q2 + q3 + q4) / 4).toFixed(2);
            });
          });
        });

        saveGradesBtn.onclick = () => {
          const payload = [];

          gradingTableBody.querySelectorAll("tr").forEach((tr, index) => {
            payload.push({
              studentId: students[index].student_id,
              sectionId,
              subjectId,
              q1: +tr.querySelector(".q1").value || 0,
              q2: +tr.querySelector(".q2").value || 0,
              q3: +tr.querySelector(".q3").value || 0,
              q4: +tr.querySelector(".q4").value || 0,
              final_grade: +tr.querySelector(".final-grade").textContent || 0
            });
          });

          Promise.all(payload.map(p =>
            fetch("http://localhost:3000/grades", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(p)
            })
          ))
            .then(() => alert("Grades saved successfully"))
            .catch(() => alert("Failed to save grades"));
        };
      });
  }

  backBtn.addEventListener("click", () => {
    gradingSheetView.classList.add("hidden");
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

  document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    console.log("Clicked:", e.currentTarget.textContent);
  });
 });
});
