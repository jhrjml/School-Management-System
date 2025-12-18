document.addEventListener("DOMContentLoaded", () => {
  // VERIFY TEACHER LOGIN
  const teacherId = localStorage.getItem("teacherId") || sessionStorage.getItem("teacherId");
  if (!teacherId) {
    alert("Please login again.");
    location.href = "login.html";
    return;
  }

  // TABLE, BUTTON, MODAL
  const searchBtn = document.getElementById("searchBtn");
  const tableBody = document.getElementById("repositoryTableBody");
  const noResults = document.getElementById("noResults");
  const modal = document.getElementById("viewModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  // FILTER INPUT OF RHE GRADE LEVEL - SECTION - SUBJECT, MONTH AND SCHOOL YEAR
  const filterSection = document.getElementById("filterSection");
  const filterSY = document.getElementById("filterSY");
  const filterMonth = document.getElementById("filterMonth");

  let sectionData = [];

  noResults.textContent = "No records found";
  noResults.style.display = "block";

  // LOAD THE FILTERS
  async function loadFilters() {
    const res = await fetch(`http://localhost:3000/teacher/${teacherId}/grade-info/attendance`);
    sectionData = await res.json();

    filterSection.innerHTML = `<option value="">Select Section & Subject</option>`;
    filterSY.innerHTML = `<option value="">Select School Year</option>`;

    const seen = {};
    sectionData.forEach(s => {
      const key = `${s.sectionId}-${s.subjectId}`;
      if (!seen[key]) {
        seen[key] = true;
        filterSection.innerHTML += `
          <option value="${key}" data-school-year="${s.school_year}">
            ${s.gradeName} - ${s.sectionName} - ${s.subjectName}
          </option>`;
      }
    });
  }

  // THE SECTION FILTER
  filterSection.addEventListener("change", () => {
    filterSY.innerHTML = `<option value="">Select School Year</option>`;
    if (!filterSection.value) return;

    const selectedOption = filterSection.options[filterSection.selectedIndex];
    const schoolYear = selectedOption.getAttribute("data-school-year");
    if (schoolYear) {
      filterSY.innerHTML += `<option value="${schoolYear}">${schoolYear}</option>`;
    }
  });

  // FOR SEARCH BUTTON
  searchBtn.onclick = async () => {
    if (!filterSection.value || !filterSY.value || !filterMonth.value) return;

    const [sectionId, subjectId] = filterSection.value.split("-");
    const schoolYear = filterSY.value;
    const monthName = filterMonth.value;

    const monthMap = {
      January:"01", February:"02", March:"03", April:"04",
      May:"05", June:"06", July:"07", August:"08",
      September:"09", October:"10", November:"11", December:"12"
    };

    const year = schoolYear.split("-")[0];
    const month = `${year}-${monthMap[monthName]}`;

    const url = new URL("http://localhost:3000/api/attendances");
    url.searchParams.append("sectionId", sectionId);
    url.searchParams.append("subjectId", subjectId);
    url.searchParams.append("schoolYear", schoolYear);
    url.searchParams.append("month", month);

    const res = await fetch(url);
    const data = await res.json();

    renderRepository(data);
  };

  function renderRepository(data) {
    tableBody.innerHTML = "";
    if (!data.length) {
      noResults.style.display = "block";
      return;
    }
    noResults.style.display = "none";

    const grouped = {};
    data.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = {};
      grouped[r.date][r.student_id] = r;
    });

    Object.keys(grouped).forEach(date => {
      const list = Object.values(grouped[date]);
      const total = list.length;
      const present = list.filter(r => r.status === "Present").length;
      const absent = total - present;

      tableBody.innerHTML += `
        <tr>
          <td>${formatDate(date)}</td>
          <td>${list[0].gradeName} - ${list[0].sectionName} - ${list[0].subjectName || "-"}</td>
          <td>${total}</td>
          <td class="stat-present">${present}</td>
          <td class="stat-absent">${absent}</td>
          <td><span class="status-badge submitted">Submitted</span></td>
          <td>
            <button class="btn-select" onclick='openModal("${date}", ${JSON.stringify(list)})'>
              <i class="fas fa-eye"></i> View
            </button>
          </td>
        </tr>`;
    });
  }

  window.openModal = (date, students) => {
    modalTitle.textContent = `Attendance – ${formatDate(date)}`;
    modalBody.innerHTML = "";

    students.forEach(s => {
      modalBody.innerHTML += `
        <tr>
          <td>${s.studentName}</td>
          <td style="color:${s.status==="Present"?"green":"red"}">${s.status}</td>
        </tr>`;
    });

    modal.style.display = "flex";
  };

  window.closeModal = () => modal.style.display = "none";

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });
  }

  loadFilters();
});
