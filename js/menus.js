const menusList = document.getElementById("menus-list");
const menusError = document.getElementById("menus-error");
const menuTemplate = document.getElementById("menu-template");

const filterDateInput = document.getElementById("filter-date");
const resetFilterBtn = document.getElementById("reset-filter-btn");

const menuForm = document.getElementById("menu-form");
const formTitle = document.getElementById("form-title");
const formSubmitBtn = document.getElementById("form-submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const menuFormError = document.getElementById("menu-form-error");
const checkboxesContainer = document.getElementById("menu-products-checkboxes");

let editingMenuId = null;

async function loadProductCheckboxes() {
    if (localStorage.getItem("role") !== "admin") {
        return;
    }

    try {
        const products = await apiRequest("/products");
        checkboxesContainer.innerHTML = "";

        if (products.length === 0) {
            checkboxesContainer.textContent = "Aucun produit disponible.";
            return;
        }

        for (const product of products) {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = product.id;

            label.appendChild(checkbox); //checkbox in label so that if we click on the text it still checks the checkbox
            label.append(" " + product.name);
            checkboxesContainer.appendChild(label);
        }
    } catch (error) {
        menuFormError.textContent = "Impossible de charger les produits : " + error.message;
    }
}

function formatMenuDates(startDate, endDate) {
    if (!startDate && !endDate) {
        return "Permanent";
    }
    if (startDate && endDate) {
        return "Du " + startDate + " au " + endDate;
    }
    if (startDate) {
        return "À partir du " + startDate;
    }
    return "Jusqu'au " + endDate;
}

async function loadMenus(filterDate = "") {
    menusError.textContent = "";
    menusList.innerHTML = "";

    let endpoint = "/menus";
    if (filterDate) {
        endpoint += "?date=" + filterDate;
    }

    try {
        const menus = await apiRequest(endpoint);

        if (menus.length === 0) {
            menusList.textContent = "Aucun menu disponible.";
            return;
        }

        for (const menu of menus) {
            const clone = menuTemplate.content.cloneNode(true);

            clone.querySelector(".menu-name").textContent = menu.name;
            clone.querySelector(".menu-description").textContent = menu.description || "";
            const productNames = [];
            for (const product of menu.products) {
                productNames.push(product.name);
            }
            clone.querySelector(".menu-products").textContent = productNames.join(", ");
            clone.querySelector(".menu-dates").textContent = formatMenuDates(menu.start_date, menu.end_date);
            clone.querySelector(".menu-price").textContent = menu.price;

            const statusEl = clone.querySelector(".menu-status");

            if (menu.is_available) {
                statusEl.textContent = "Disponible";
            } else {
                statusEl.textContent = "Indisponible";
            }

            const editBtn = clone.querySelector(".edit-btn");
            editBtn.addEventListener("click", () => {
                startEditing(menu);
            });

            const deleteBtn = clone.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteMenu(menu.id, menu.name);
            });

            menusList.appendChild(clone);
        }

        updateUIByRole();
    } catch (error) {
        menusError.textContent = error.message;
    }
}

function startEditing(menu) {
    editingMenuId = menu.id;

    document.getElementById("menu-name").value = menu.name;
    document.getElementById("menu-description").value = menu.description || "";
    document.getElementById("menu-price").value = menu.price;
    document.getElementById("menu-start-date").value = menu.start_date || "";
    document.getElementById("menu-end-date").value = menu.end_date || "";
    document.getElementById("menu-available").checked = menu.is_available;

    const includedIds = [];
    for (const product of menu.products) {
        includedIds.push(product.id);
    }
    const checkboxes = checkboxesContainer.querySelectorAll("input");
    for (const cb of checkboxes) {
        cb.checked = includedIds.includes(parseInt(cb.value, 10));
    }

    formTitle.textContent = "Modifier le menu";
    formSubmitBtn.textContent = "Modifier";
    cancelEditBtn.hidden = false;
    menuFormError.textContent = "";
}

function resetForm() {
    editingMenuId = null;
    menuForm.reset();

    formTitle.textContent = "Ajouter un menu";
    formSubmitBtn.textContent = "Ajouter";
    cancelEditBtn.hidden = true;
    menuFormError.textContent = "";
}

cancelEditBtn.addEventListener("click", () => {
    resetForm();
});

filterDateInput.addEventListener("change", () => {
    loadMenus(filterDateInput.value);
});

resetFilterBtn.addEventListener("click", () => {
    filterDateInput.value = "";
    loadMenus();
});

menuForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    menuFormError.textContent = "";

    const checkedBoxes = checkboxesContainer.querySelectorAll("input");
    const productIds = [];
    for (const cb of checkedBoxes) {
        if (cb.checked) {
            productIds.push(parseInt(cb.value, 10));
        }
    }

    if (productIds.length === 0) {
        menuFormError.textContent = "Un menu doit contenir au moins un produit.";
        return;
    }

    const menuData = {
        name: document.getElementById("menu-name").value.trim(),
        description: document.getElementById("menu-description").value.trim() || null,
        price: parseFloat(document.getElementById("menu-price").value),
        is_available: document.getElementById("menu-available").checked,
        start_date: document.getElementById("menu-start-date").value || null,
        end_date: document.getElementById("menu-end-date").value || null,
        product_ids: productIds
    };

    try {
        if (editingMenuId === null) {
            await apiRequest("/menus", "POST", menuData);
        } else {
            await apiRequest("/menus/" + editingMenuId, "PUT", menuData);
        }

        resetForm();
        loadMenus(filterDateInput.value);
    } catch (error) {
        menuFormError.textContent = error.message;
    }
});

async function deleteMenu(menuId, menuName) {
    if (!confirm("Supprimer le menu '" + menuName + "' ?")) {
        return;
    }

    try {
        await apiRequest("/menus/" + menuId, "DELETE");

        if (editingMenuId === menuId) {
            resetForm();
        }

        loadMenus(filterDateInput.value);
    } catch (error) {
        menusError.textContent = error.message;
    }
}

loadProductCheckboxes();
loadMenus();