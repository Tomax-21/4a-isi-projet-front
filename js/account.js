requireAuth();

const passwordForm = document.getElementById("password-form");
const passwordError = document.getElementById("password-error");
const passwordSuccess = document.getElementById("password-success");

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  passwordError.textContent = "";
  passwordSuccess.textContent = "";

  const oldPassword = document.getElementById("old-password").value;
  const newPassword = document.getElementById("new-password").value;

  try {
    const data = await apiRequest("/users/me/password", "PATCH", {
      old_password: oldPassword,
      new_password: newPassword,
    });

    passwordSuccess.textContent = data.message;
    passwordForm.reset();
  } catch (error) {
    passwordError.textContent = error.message;
  }
});