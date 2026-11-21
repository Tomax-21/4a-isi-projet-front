const registerForm = document.getElementById("register-form");
const registerError = document.getElementById("register-error");
const registerResult = document.getElementById("register-result");
const generatedPassword = document.getElementById("generated-password");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault(); //prevents the page from refreshing

  registerError.textContent = "";
  registerResult.hidden = true;

  const username = document.getElementById("register-username").value.trim(); //trim removes the unecesseray spaces befgore or after the username

  try {
    const data = await apiRequest("/users", "POST", { username: username });

    generatedPassword.textContent = data.password;
    registerResult.hidden = false;
    registerForm.reset();

  } catch (error) {
    registerError.textContent = error.message;
  }
});


loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.textContent = "";

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const data = await apiRequest("/auth/login", "POST", { username: username, password: password });

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);

    window.location.href = "index.html";
  } catch (error) {
    loginError.textContent = error.message;
  }
});