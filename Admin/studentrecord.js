document.addEventListener("DOMContentLoaded", () => {
  // GET THE STUDENT ID
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("id");

  if (!studentId) {
    alert("No student ID found.");
    throw new Error("Missing student ID");
  }

  // LOAD  THE STUDENT INFORMATION
  async function loadStudent() {
    try {
      const res = await fetch(`http://localhost:3000/students/${studentId}`);
      if (!res.ok) throw new Error("Student not found");
      const student = await res.json();

      const dobFormatted = student.dob ? student.dob.split("T")[0] : "-";

      document.getElementById("name").textContent =
        `${student.firstname} ${student.middlename || ""} ${student.lastname}`;
      document.getElementById("gender").textContent = student.gender || "-";
      document.getElementById("dob").textContent = dobFormatted;

      const gradeSection = student.section_name
        ? `${student.gradelevel} - ${student.section_name}`
        : student.gradelevel || "-";

      document.getElementById("gradelevel").textContent = gradeSection;

      document.getElementById("lrn").textContent = student.lrn || "-";
      document.getElementById("parentname").textContent = student.parentname || "-";
      document.getElementById("contact").textContent = student.contactnumber || "-";
      document.getElementById("address").textContent = student.address || "-";

    } catch (err) {
      console.error("Error loading student:", err);
      alert("Failed to load student information.");
    }
  }

  // LOAD THE STUDENT GRADES
  async function loadGrades() {
    try {
      const res = await fetch(`http://localhost:3000/grades/student-record/${studentId}`);
      if (!res.ok) throw new Error("Grades not found");

      const groupedGrades = await res.json();
      const gradeContainer = document.getElementById("gradeContainer");
      gradeContainer.innerHTML = "";

      for (const gradeSection in groupedGrades) {
        const table = document.createElement("table");
        table.className = "grade-table";

        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th colspan="6">${gradeSection}</th>
          </tr>
          <tr>
            <th>Subject</th>
            <th>Q1</th>
            <th>Q2</th>
            <th>Q3</th>
            <th>Q4</th>
            <th>Final Grade</th>
          </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        groupedGrades[gradeSection].forEach(g => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${g.subject_name ?? "-"}</td>
            <td>${g.q1 ?? "-"}</td>
            <td>${g.q2 ?? "-"}</td>
            <td>${g.q3 ?? "-"}</td>
            <td>${g.q4 ?? "-"}</td>
            <td>${g.final_grade ?? "-"}</td>
          `;
          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        gradeContainer.appendChild(table);
      }
    } catch (err) {
      console.error("Error loading grades:", err);
      document.getElementById("gradeContainer").innerHTML = "<p>Failed to load grades.</p>";
    }
  }

  loadStudent();
  loadGrades();
});