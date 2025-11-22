document.addEventListener("DOMContentLoaded", () => {
  const registerPanel = document.getElementById('registerPanel');
  const loginPanel = document.getElementById('loginPanel');
  const loggedInPanel = document.getElementById('loggedInPanel');
  const overlayLogin = document.getElementById('overlayLogin');
  const overlayRegister = document.getElementById('overlayRegister');

  // Buttons
  const showLoginBtn = document.getElementById('showLogin');
  const showRegisterBtn = document.getElementById('showRegister');
  const logoutBtn = document.getElementById('logoutBtn');

  // Switch to Login
  showLoginBtn.addEventListener('click', () => {
    registerPanel.classList.remove('active');
    loginPanel.classList.add('active');
    overlayLogin.classList.remove('active');
    overlayRegister.classList.add('active');
  });

  // Switch to Register
  showRegisterBtn.addEventListener('click', () => {
    loginPanel.classList.remove('active');
    registerPanel.classList.add('active');
    overlayRegister.classList.remove('active');
    overlayLogin.classList.add('active');
  });

  // Check if user is logged in
  function checkLoggedIn() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
      registerPanel.classList.remove('active');
      loginPanel.classList.remove('active');
      loggedInPanel.classList.add('active');
      document.getElementById('welcomeName').textContent = user.fullName || user.username;
      document.querySelector('.overlayPanel').style.display = 'none';
    }
  }

  // Register
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const dob = document.getElementById("dob").value;
    const email = document.getElementById("registerEmail").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!fullName || !dob || !email || !username || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.some(u => u.username === username || u.email === email);
    if (exists) {
      alert("This username or email is already registered.");
      return;
    }

    users.push({ fullName, dob, username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! You can now log in.");
    document.getElementById('registerForm').reset();
    showLoginBtn.click();
  });

  // Login
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const loginInput = document.getElementById("loginUsername").value.trim();
    const loginPassword = document.getElementById("loginPassword").value;

    if (!loginInput || !loginPassword) {
      alert("Please enter both username/email and password.");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u =>
      (u.username === loginInput || u.email === loginInput) && u.password === loginPassword
    );

    if (user) {
      alert("Login successful! Welcome back, " + user.username + ".");
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      checkLoggedIn();
    } else {
      alert("Login failed. Please register first or check your credentials.");
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("loggedInUser");
    alert("You have been logged out.");
    location.reload();
  });

  checkLoggedIn();
});
