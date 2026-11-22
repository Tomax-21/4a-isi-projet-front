function updateUIByRole() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  let isLoggedIn = false;
  let isAdmin = false;

  if (token !== null) {
    isLoggedIn = true
  }

  if (isLoggedIn && role === "admin"){
    isAdmin = true
  }

  const guestElements = document.querySelectorAll(".guest-only");
  for (const element of guestElements) {
    element.hidden = isLoggedIn;
  }

  const userElements = document.querySelectorAll(".user-only");
  for (const element of userElements) {
    element.hidden = !isLoggedIn;
  }

  const adminElements = document.querySelectorAll(".admin-only");
  for (const element of adminElements) {
    element.hidden = !isAdmin;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

function requireAuth() {
  if (localStorage.getItem("token") === null) {
    window.location.href = "login.html";
  }
}

updateUIByRole();

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}