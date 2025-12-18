const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const app = express();
require('dotenv').config();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Admin")));
 
// THE DATABASE CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL Database!");
});

// THE START ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Admin", "login.html"));
});

// THE LOG IN PAGE
app.post("/login", (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();

  if (!username || !password)
    return res.status(400).json({ success: false, message: "Username and password required" });

  const sql = "SELECT * FROM teachers WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0)
      return res.json({ success: false, message: "Invalid username or password" });

    const teacher = result[0];

    res.json({
  success: true,
  teacher: {
    id: teacher.id, employeeId: teacher.teacherid, firstname: teacher.firstname,
    middlename: teacher.middlename, lastname: teacher.lastname, gender: teacher.gender,
    dob: teacher.dob, hd: teacher.hd, contactNumber: teacher.contactnumber, 
    address: teacher.address, email: teacher.email, salary: teacher.salary,
    username: teacher.username, password: teacher.password
  }
});

  });
});

// STUDENT CRUD
// GET ALL STUDENT AND SEARCH STUDENT
app.get("/students", (req, res) => {
  const search = req.query.search;
  let sql = "SELECT * FROM students";
  const params = [];

  if (search) {
    sql += " WHERE firstname LIKE ? OR lastname LIKE ?";
    params.push(`${search}%`, `${search}%`);
  }

  console.log("Executing:/students", sql, params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch students" });
    }
    res.json(results);
  });
});

// ADD STUDENT
app.post("/students", (req, res) => {
  const {
    firstname, middlename, lastname, gender, gradelevel,
    dob, lrn, parentname, contactnumber, address
  } = req.body;

  if (!firstname || !lastname || !gender || !gradelevel || !dob)
    return res.status(400).json({ error: "Missing required fields" });

  const sql = `
    INSERT INTO students
    (firstname, middlename, lastname, gender, gradelevel, dob, lrn, 
    parentname, contactnumber, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [firstname, middlename, lastname, gender, gradelevel, dob,
    lrn, parentname, contactnumber, address],

  (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to add student" });
    res.json({ message: "Student added successfully", id: result.insertId });
  });
});

// EDIT STUDENT
app.put("/students/:id", (req, res) => {
  const studentId = req.params.id;
  const {
    firstname, middlename, lastname, gender, gradelevel,
    dob, lrn, parentname, contactnumber, address
  } = req.body;

  if (!firstname || !lastname || !gender || !gradelevel || !dob)
    return res.status(400).json({ error: "Missing required fields" });

  const sql = `
    UPDATE students SET
    firstname=?, middlename=?, lastname=?, gender=?, gradelevel=?, dob=?,
    lrn=?, parentname=?, contactnumber=?, address=?
    WHERE id=?
  `;

  db.query(sql, [
    firstname, middlename, lastname, gender, gradelevel, dob,
    lrn, parentname, contactnumber, address, studentId
  ],
  (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update student" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student updated successfully" });
  });
});

// DELETE STUDENT
app.delete("/students/:id", (req, res) => {
  const studentId = req.params.id;
  db.query("DELETE FROM students WHERE id=?", [studentId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete student" });
    res.json({ message: "Student deleted successfully" });
  });
});

// GET THE STUDENT INFORMATION FOR STUDENT RECORD
app.get("/students/:id", (req, res) => {
  const studentId = req.params.id;

  const sql = `
    SELECT 
      s.id, s.firstname, s.middlename, s.lastname,
      s.gender, s.dob, s.gradelevel, s.lrn, s.parentname,
      s.contactnumber, s.address,
      sec.name AS section_name
    FROM students s
    LEFT JOIN section_students ss ON ss.student_id = s.id
    LEFT JOIN sections sec ON ss.section_id = sec.id
    WHERE s.id = ?
    LIMIT 1
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Failed to fetch student:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(results[0]);
  });
});

// GET GRADE LEVEL, SECTION AND SUBJECT OF A STUDENT
app.get("/grades/student-record/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const sql = `
    SELECT 
      gl.name AS grade_level,
      s.name AS section_name,
      sub.subject_name,
      g.q1, g.q2, g.q3, g.q4, g.final_grade
    FROM grades g
    LEFT JOIN subjects sub ON g.subject_id = sub.id
    LEFT JOIN sections s ON g.section_id = s.id
    LEFT JOIN grade_levels gl ON s.grade_level_id = gl.id
    WHERE g.student_id = ?
    ORDER BY gl.name, s.name, sub.subject_name
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching student grades:", err);
      return res.status(500).json({ error: "Failed to fetch student grades" });
    }

    const grouped = {};
    results.forEach(r => {
      const key = `${r.grade_level} - ${r.section_name}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    res.json(grouped);
  });
});

// GET THE GRADES OF THE STUDENT
app.get("/grades/student/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const sql = `
    SELECT g.q1, g.q2, g.q3, g.q4, g.final_grade,
           sub.subject_name AS subject,
           s.gradelevel
    FROM grades g
    JOIN subjects sub ON g.subject_id = sub.id
    JOIN students s ON g.student_id = s.id
    WHERE g.student_id = ?
    ORDER BY s.gradelevel, sub.subject_name;
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching grades for student record:", err);
      return res.status(500).json({ error: "Failed to fetch grades" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Grades not found" });
    }
    res.json(results);
  });
});

// TEACHERS CRUD
// CHECK FOR DUPLICATE EMPLOYEE ID
app.get("/check-teacherid/:id", (req, res) => {
  const teacherId = req.params.id.toUpperCase();
  db.query(
    "SELECT id FROM teachers WHERE teacherid = ?",
    [teacherId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ exists: results.length > 0 });
    }
  );
});

// GET ALL THE TEACHER AND FOR SEARCHING TEACHER
app.get("/teachers", (req, res) => {
  const search = req.query.search;
  let sql = "SELECT * FROM teachers";
  const params = [];

  if (search) {
    sql += " WHERE firstname LIKE ? OR lastname LIKE ?";
    params.push(`${search}%`, `${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch teachers" });
    res.json(results);
  });
});

// ADD TEACHER
app.post("/teachers", (req, res) => {
  const {
    teacherid, firstname, middlename, lastname, gender,
    dob, hd, email, contactnumber, address, salary,
    username, password
  } = req.body;

  if (!teacherid || !firstname || !lastname || !gender ||
      !dob || !hd || !email || !username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO teachers 
    (teacherid, firstname, middlename, lastname, gender, dob, hd, email,
    contactnumber, address, salary, username, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      teacherid, firstname, middlename, lastname, gender,
      dob, hd, email, contactnumber, address, salary,
      username, password
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to add teacher" });
      res.json({ message: "Teacher added successfully", id: result.insertId });
    }
  );
});

// EDIT TEACHER
app.put("/teachers/:id", (req, res) => {
  const id = req.params.id;

  const {
    teacherid, firstname, middlename, lastname, gender,
    dob, hd, email, contactnumber, address, salary,
    username, password
  } = req.body;

  const sql = `
    UPDATE teachers SET
      teacherid=?, firstname=?, middlename=?, lastname=?, gender=?,
      dob=?, hd=?, email=?, contactnumber=?, address=?,
      salary=?, username=?, password=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      teacherid, firstname, middlename, lastname, gender,
      dob, hd, email, contactnumber, address, salary,
      username, password, id
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update teacher" });
      res.json({ message: "Teacher updated successfully" });
    }
  );
});

// DELETE TEACHER
app.delete("/teachers/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM teachers WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete teacher" });
    res.json({ message: "Teacher deleted successfully" });
  });
});

// UPDATING THE TEACHER USERNAME AND PASSWORD
app.post("/updateTeacher", (req, res) => {
  const { id, username, password } = req.body;

  if (!id || !username || !password) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  const sql = "UPDATE teachers SET username = ?, password = ? WHERE id = ?";
  db.query(sql, [username, password, id], (err, result) => {
    if (err) {
      console.error("Failed to update teacher:", err);
      return res.json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Teacher not found" });
    }

    res.json({ success: true, message: "Teacher updated successfully" });
  });
});

// GRADE LEVEL CRUD
// GET ALL THE GRADES LEVEl
app.get("/grade-levels", (req, res) => {
  const sql = "SELECT * FROM grade_levels ORDER BY id ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch grade levels" });
    res.json(results);
  });
});

// ADD GRADE LEVEL
app.post("/grade-levels", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  db.query("INSERT INTO grade_levels (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to add grade level" });
    res.json({ message: "Grade level added", id: result.insertId });
  });
});

// UPDATE GRADE LEVEL
app.put("/grade-levels/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query("UPDATE grade_levels SET name=? WHERE id=?", [name, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update grade level" });
    res.json({ message: "Grade level updated" });
  });
});

// DELETE GRADE LEVEL
app.delete("/grade-levels/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM grade_levels WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete grade level" });
    res.json({ message: "Grade level deleted" });
  });
});

// SECTIONS CRUD
// GET ALL THE SECTION OF A GRADE LEVEL
app.get("/sections/:gradeId", (req,res)=>{
  const sql = `
    SELECT s.*, t.firstname, t.lastname
    FROM sections s
    LEFT JOIN teachers t ON s.teacher_id=t.id
    WHERE s.grade_level_id=?
  `;
  db.query(sql,[req.params.gradeId],(err,results)=>{
    if(err) return res.status(500).json({error:"Failed to fetch sections"});
    const formatted = results.map(r=>({
      ...r,
      teacher_name: r.firstname && r.lastname ? `${r.firstname} ${r.lastname}` : "-"
    }));
    res.json(formatted);
  });
});

// ADD SECTION
app.post("/sections",(req,res)=>{
  const {name, gradeId, teacher_id} = req.body;
  if(!name || !gradeId) return res.status(400).json({error:"Name and gradeId required"});
  const sql = "INSERT INTO sections (name, grade_level_id, teacher_id) VALUES (?,?,?)";
  db.query(sql,[name, gradeId, teacher_id || null],(err,result)=>{
    if(err) return res.status(500).json({error:"Failed to add section"});
    res.json({message:"Section added", id: result.insertId});
  });
});

// EDIT SECTION
app.put("/sections/:id",(req,res)=>{
  const {name, teacher_id} = req.body;
  const sql = "UPDATE sections SET name=?, teacher_id=? WHERE id=?";
  db.query(sql,[name, teacher_id || null, req.params.id],(err,result)=>{
    if(err) return res.status(500).json({error:"Failed to update section"});
    res.json({message:"Section updated"});
  });
});

// DELETE SECTION
app.delete("/sections/:id",(req,res)=>{
  db.query("DELETE FROM sections WHERE id=?",[req.params.id],(err,result)=>{
    if(err) return res.status(500).json({error:"Failed to delete section"});
    res.json({message:"Section deleted"});
  });
});

// GET ALL SECTION
app.get("/all-sections", (req,res)=>{
  const sql = `
    SELECT s.id, s.name, s.grade_level_id, s.teacher_id
    FROM sections s
  `;
  db.query(sql, (err, results)=>{
    if(err) return res.status(500).json({error:"Failed to fetch sections"});
    res.json(results);
  });
});

// SECTION-STUDENTS CRUD
// GET THE STUDENT ASSIGNED IN THAT SECTION
app.get("/section-students/:sectionId", (req,res)=>{
  const sectionId = req.params.sectionId;
  const sql = `
    SELECT 
      ss.student_id, s.firstname, s.middlename, s.lastname,
      s.lrn, s.gradelevel, s.gender
    FROM section_students ss
    JOIN students s ON ss.student_id = s.id
    WHERE ss.section_id = ?
  `;
  db.query(sql, [sectionId], (err, results)=>{
    if(err) return res.status(500).json({error:"Failed to fetch students"});
    res.json(results);
  });
});

// ADD STUDENT TO THE SECTION
app.post("/section-students", (req,res)=>{
  const { studentId, sectionId } = req.body;
  if(!studentId || !sectionId) return res.status(400).json({error:"studentId and sectionId required"});
  const sql = "INSERT INTO section_students (student_id, section_id) VALUES (?, ?)";
  db.query(sql, [studentId, sectionId], (err,result)=>{
    if(err) return res.status(500).json({error:"Failed to add student to section"});
    res.json({message:"Student added to section"});
  });
});

// REMOVE THE STUDENT IN THAT SECTION
app.post("/section-students/delete", (req,res)=>{
  const { studentId, sectionId } = req.body;
  if(!studentId || !sectionId) return res.status(400).json({error:"studentId and sectionId required"});
  const sql = "DELETE FROM section_students WHERE student_id=? AND section_id=?";
  db.query(sql, [studentId, sectionId], (err,result)=>{
    if(err) return res.status(500).json({error:"Failed to remove student from section"});
    res.json({message:"Student removed successfully"});
  });
});

// GET ALL STUDENT ASSIGNED SECTION FOR FILTERING
app.get("/all-section-students", (req,res)=>{
  const sql = `
    SELECT 
      ss.student_id AS studentId, st.firstname, st.middlename,
      st.lastname, st.lrn, s.id AS sectionId, s.name AS sectionName,
      gl.id AS gradeId, gl.name AS gradeLevelName
    FROM section_students ss
    JOIN students st ON ss.student_id = st.id
    JOIN sections s ON ss.section_id = s.id
    JOIN grade_levels gl ON s.grade_level_id = gl.id
    ORDER BY st.lastname, st.firstname
  `;
  db.query(sql,(err,results)=>{
    if(err) return res.status(500).json({error:"Failed to fetch assigned students"});
    res.json(results);
  });
});

// GET ALL STUDENT FOR DROPDOWN
app.get("/all-students", (req,res)=>{
  const sql = "SELECT * FROM students ORDER BY lastname, firstname";
  db.query(sql,(err,results)=>{
    if(err) return res.status(500).json({error:"Failed to fetch students"});
    res.json(results);
  });
});

// SUBJECTS CRUD
// GET THE SUBJECT
app.get("/subjects/:sectionId", (req, res) => {
  const sql = `
    SELECT subjects.id, subjects.subject_name, subjects.school_year, subjects.time,
           teachers.firstname, teachers.lastname
    FROM subjects
    LEFT JOIN teachers ON subjects.teacher_id = teachers.id
    WHERE section_id = ?
    ORDER BY subjects.subject_name
  `;
  db.query(sql, [req.params.sectionId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to load subjects" });
    }
    const formatted = results.map(r => ({
      id: r.id, subject_name: r.subject_name,
      school_year: r.school_year, time: r.time,
      teacher_name: `${r.firstname || ""} ${r.lastname || ""}`.trim()
    }));
    res.json(formatted);
  });
});

// ADD SUBJECT
app.post("/subjects", (req, res) => {
  const { subject_name, teacher_id, school_year, time, section_id } = req.body;

  if (!subject_name || !section_id) {
    return res.status(400).json({ error: "Subject name and section ID are required" });
  }

  const sql = `
    INSERT INTO subjects (subject_name, teacher_id, school_year, time, section_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [subject_name, teacher_id, school_year, time, section_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to add subject" });
    }
    res.json({ message: "Subject added successfully", id: result.insertId });
  });
});

// DELETE SUBJECT
app.delete("/subjects/:id", (req, res) => {
  db.query("DELETE FROM subjects WHERE id=?", [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to delete subject" });
    }
    res.json({ message: "Subject deleted successfully" });
  });
});

// EDIT SUBJECT
app.put("/subjects/:id", (req, res) => {
  const { id } = req.params;
  const { subject_name, teacher_id, school_year, time } = req.body;

  if (!subject_name || !time) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const sql = `
    UPDATE subjects
    SET subject_name = ?, teacher_id = ?, school_year = ?, time = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [subject_name, teacher_id || null, school_year, time, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Subject not found" });

      res.json({ message: "Subject updated successfully" });
    }
  );
});

// TEACHER HOMEPAGE
// GET TEACHER SUBJECT, GRADE LEVEL, SECTION AND SCHEDULE FOR GRADES
app.get("/teacher/:teacherId/grade-info/grades", (req, res) => {
  const teacherId = req.params.teacherId;

  const sql = `
    SELECT 
      gl.id AS gradeId,
      gl.name AS gradeName,
      s.id AS sectionId,
      s.name AS sectionName,
      sub.id AS subjectId,
      sub.subject_name AS subjectName,
      sub.time AS schedule
    FROM sections s
    JOIN grade_levels gl ON s.grade_level_id = gl.id
    JOIN subjects sub 
      ON sub.section_id = s.id 
     AND sub.teacher_id = ?
    ORDER BY gl.id, s.id, sub.subject_name;
  `;

  db.query(sql, [teacherId], (err, results) => {
    if (err) {
      console.error("Error fetching teacher grade-info (grades):", err);
      return res.status(500).json({ error: "Failed to load teacher grade info" });
    }

    res.json(results);
  });
});

// GET STUDENT IN THE SECTION
app.get('/section-students/:sectionId', (req, res) => {
  const sectionId = req.params.sectionId;

  if (!sectionId) return res.status(400).json({ error: "sectionId is required" });

  const sql = `
    SELECT s.id AS studentId, s.firstname, s.lastname, s.middlename,
           g.q1, g.q2, g.q3, g.q4, g.final_grade,
           sub.id AS subjectId, sub.subject_name
    FROM section_students ss
    JOIN students s ON ss.student_id = s.id
    LEFT JOIN subjects sub ON sub.section_id = ss.section_id
    LEFT JOIN grades g
        ON g.student_id = s.id
       AND g.section_id = ss.section_id
       AND g.subject_id = sub.id
    WHERE ss.section_id = ?
    ORDER BY s.lastname, s.firstname;
  `;

  db.query(sql, [sectionId], (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: "Failed to fetch students" });
    }
    res.json(results);
  });
});

// INSERT GRADES
app.post('/grades', (req, res) => {
  const {
    studentId, sectionId, subjectId,
    q1 = null, q2 = null,
    q3 = null, q4 = null,
    final_grade = null
  } = req.body;

  if (!studentId || !sectionId || !subjectId) {
    return res.status(400).json({ error: "studentId, sectionId, and subjectId are required" });
  }

  const sql = `
    INSERT INTO grades (student_id, section_id, subject_id, q1, q2, q3, q4, final_grade)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      q1 = VALUES(q1),
      q2 = VALUES(q2),
      q3 = VALUES(q3),
      q4 = VALUES(q4),
      final_grade = VALUES(final_grade);
  `;

  db.query(sql, [studentId, sectionId, subjectId, q1, q2, q3, q4, final_grade], (err, result) => {
    if (err) {
      console.error("Error inserting/updating grade:", err);
      return res.status(500).json({ error: "Failed to save grade" });
    }
    res.json({ message: "Grade saved successfully" });
  });
});

// ATTENDANCE
// MARKING THE ATTENDANCE OF THE STUDENT
app.post('/attendance', (req, res) => {
  const records = req.body;

  if (!records || !records.length) {
    return res.status(400).json({ error: "No attendance records provided" });
  }

  const values = records.map(r => [r.studentId, r.sectionId, r.status, new Date()]);
  const sql = `INSERT INTO attendance (student_id, section_id, status, date) VALUES ?`;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Attendance submitted successfully" });
  });
});

// REPOSITORY 
// GET TEACHER SUBJECT, GRADE LEVEL, SECTION FOR ATTENDANCE
app.get("/teacher/:teacherId/grade-info/attendance", (req, res) => {
  const teacherId = req.params.teacherId;

  const sql = `
    SELECT 
      gl.id AS gradeId,
      gl.name AS gradeName,
      s.id AS sectionId,
      s.name AS sectionName,
      sub.id AS subjectId,
      sub.subject_name AS subjectName,
      sub.school_year,
      sub.time AS schedule,
      CONCAT(t.firstname, ' ', t.lastname) AS adviser,
      (SELECT COUNT(*) FROM section_students ss WHERE ss.section_id = s.id) AS totalStudents
    FROM sections s
    JOIN grade_levels gl ON s.grade_level_id = gl.id
    JOIN subjects sub ON sub.section_id = s.id AND sub.teacher_id = ?
    LEFT JOIN teachers t ON s.teacher_id = t.id
    ORDER BY gl.id, s.id, sub.subject_name;
  `;

  db.query(sql, [teacherId], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to load teacher grade info" });
    res.json(results);
  });
});

// GET THE ATTENDANCE RECORD
app.get("/api/attendances", (req, res) => {
  const { sectionId, subjectId, month, schoolYear } = req.query;

  if (!sectionId || !subjectId || !month || !schoolYear)
    return res.status(400).json({ error: "Missing parameters" });

  const sql = `
    SELECT 
      a.date, a.status, a.student_id,
      CONCAT(s.firstname, ' ', s.lastname) AS studentName,
      gl.name AS gradeName,
      sec.name AS sectionName,
      sub.subject_name AS subjectName
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN sections sec ON a.section_id = sec.id
    JOIN grade_levels gl ON sec.grade_level_id = gl.id
    JOIN subjects sub ON sub.id = ?
    WHERE a.section_id = ?
      AND DATE_FORMAT(a.date, '%Y-%m') = ?
      AND sub.school_year = ?
    ORDER BY a.date ASC, s.lastname ASC
  `;

  db.query(sql, [subjectId, sectionId, month, schoolYear], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// LOCAL HOST
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
