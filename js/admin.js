if (localStorage.getItem("role") !== "admin") {
    window.location.href = "index.html";
}


const closureForm = document.getElementById("closure-form");
const closureDateInput = document.getElementById("closure-date");
const closureReasonInput = document.getElementById("closure-reason");
const closureFormError = document.getElementById("closure-form-error");

const closuresError = document.getElementById("closures-error");
const closuresList = document.getElementById("closures-list");
const closureTemplate = document.getElementById("closure-template");

async function loadClosures() {
    closuresError.textContent = "";
    closuresList.innerHTML = "";

    try {
        const closures = await apiRequest("/closures");

        if (closures.length === 0) {
            closuresList.textContent = "Aucun jour de fermeture enregistré.";
            return;
        }

        for (const closure of closures) {
            const clone = closureTemplate.content.cloneNode(true);

            clone.querySelector(".closure-date").textContent = closure.date;

            const reasonEl = clone.querySelector(".closure-reason");
            if (closure.reason) {
                reasonEl.textContent = "Motif : " + closure.reason;
            } else {
                reasonEl.textContent = "Motif : Non précisé";
            }

            const deleteBtn = clone.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteClosure(closure.id, closure.date);
            });

            closuresList.appendChild(clone);
        }
    } catch (error) {
        closuresError.textContent = error.message;
    }
}

closureForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    closureFormError.textContent = "";

    const closureData = {
        date: closureDateInput.value,
        reason: closureReasonInput.value.trim() || null
    };

    try {
        await apiRequest("/closures", "POST", closureData);
        closureForm.reset();
        loadClosures();
    } catch (error) {
        closureFormError.textContent = error.message;
    }
});

async function deleteClosure(closureId, closureDate) {
    if (!confirm("Supprimer le jour de fermeture du " + closureDate + " ?")) {
        return;
    }

    try {
        await apiRequest("/closures/" + closureId, "DELETE");
        loadClosures();
    } catch (error) {
        closuresError.textContent = error.message;
    }
}


const usersError = document.getElementById("users-error");
const usersList = document.getElementById("users-list");
const userTemplate = document.getElementById("user-template");

async function loadUsers() {
    usersError.textContent = "";
    usersList.innerHTML = "";

    try {
        const users = await apiRequest("/users");

        if (users.length === 0) {
            usersList.textContent = "Aucun utilisateur trouvé.";
            return;
        }

        for (const user of users) {
            const clone = userTemplate.content.cloneNode(true);

            clone.querySelector(".user-username").textContent = user.username;
            clone.querySelector(".user-role").textContent = user.role;

            const statusEl = clone.querySelector(".user-status");
            const toggleBtn = clone.querySelector(".toggle-block-btn");

            if (user.is_blocked) {
                statusEl.textContent = "Statut : Banni";
                toggleBtn.textContent = "Débannir";
            } else {
                statusEl.textContent = "Statut : Actif";
                toggleBtn.textContent = "Bannir";
            }

            toggleBtn.addEventListener("click", () => {
                toggleBlockUser(user);
            });

            usersList.appendChild(clone);
        }
    } catch (error) {
        usersError.textContent = error.message;
    }
}

async function toggleBlockUser(user) {
    const newBlockedState = !user.is_blocked;

    let action;

    if (newBlockedState){
        action = "bannir"
    }
    else{
        action = "débannir"
    }

    if (!confirm("Voulez-vous vraiment " + action + " l'utilisateur '" + user.username + "' ?")) {
        return;
    }

    usersError.textContent = "";

    try {
        await apiRequest("/users/" + user.id + "/block", "PATCH", {
            is_blocked: newBlockedState
        });
        loadUsers();
    } catch (error) {
        usersError.textContent = error.message;
    }
}

loadClosures();
loadUsers();