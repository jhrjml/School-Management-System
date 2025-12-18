document
  .getElementById("loginForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // HARD CODED USERNAME AND PASSWORD OF THE ADMIN
    const adminUsername = "admin";
    const adminPassword = "admin123";

    if (username === adminUsername && password === adminPassword) {
      localStorage.setItem("adminLoggedIn", "true"); 
      window.location.href = "admin.html";
      return;
    }

    // FOR TEACHER LOGIN
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      sessionStorage.setItem("teacher", JSON.stringify(data.teacher));
      localStorage.setItem("teacherId", data.teacher.id); 

      window.location.href = "teacherhomepage.html";


    } catch (err) {
      console.error("Login error:", err);
      alert("Failed to login. Please try again.");
    }
  });
