CREATE DATABASE my_system;

USE my_system;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(20) NOT NULL,
  middlename VARCHAR(20),
  lastname VARCHAR(20) NOT NULL,
  gender ENUM('Male','Female') NOT NULL,
  dob DATE NOT NULL,
  gradelevel ENUM('Grade 7','Grade 8', 'Grade 9', 'Grade 10') NOT NULL,
  lrn VARCHAR(12),
  parentname VARCHAR(50),
  contactnumber VARCHAR(11),
  address VARCHAR(50)
);

CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(20) NOT NULL,
  middlename VARCHAR(20) NOT NULL,
  lastname VARCHAR(20) NOT NULL,
  gender ENUM('Male','Female') NOT NULL,
  dob DATE NOT NULL,
  hd DATE NOT NULL,
  email VARCHAR(50) NOT NULL,
  contactnumber VARCHAR(11) NOT NULL,
  address VARCHAR(50) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  username VARCHAR(10) NOT NULL,
  password VARCHAR(10) NOT NULL
);

CREATE TABLE grade_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    grade_level_id INT NOT NULL,
    FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id) ON DELETE CASCADE,
    UNIQUE(name, grade_level_id)
);

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(30) NOT NULL,
    teacher_id INT NOT NULL,
    section_id INT NOT NULL,
    school_year VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE section_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    section_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    UNIQUE(student_id, section_id) 
);

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    section_id INT NULL,
    subject_id INT NULL,
    q1 DECIMAL(5,2),
    q2 DECIMAL(5,2),
    q3 DECIMAL(5,2),
    q4 DECIMAL(5,2),
    final_grade DECIMAL(5,2),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
    UNIQUE(student_id, section_id, subject_id)
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  section_id INT NOT NULL,
  status ENUM('Present','Absent') NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


select * from students;
select * from teachers;
select * from grades;
select * from grade_levels;
select * from subjects;
select * from sections;
select * from attendance;
select * from section_students;