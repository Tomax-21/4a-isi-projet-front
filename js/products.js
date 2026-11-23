const productsList = document.getElementById("products-list");
const productsError = document.getElementById("products-error");
const productTemplate = document.getElementById("product-template");

const productForm = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const formSubmitBtn = document.getElementById("form-submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const productFormError = document.getElementById("product-form-error");

let editingProductId = null; //null to add, prodct id to edit

async function loadProducts() {
    productsError.textContent = "";
    productsList.innerHTML = "";

    try {
        const products = await apiRequest("/products");

        if (products.length === 0) {
            productsList.textContent = "Aucun produit disponible.";
            return;
        }

        for (const product of products) {

            const clone = productTemplate.content.cloneNode(true); //true to copy the children of the template too

            clone.querySelector(".product-name").textContent = product.name;
            clone.querySelector(".product-description").textContent = product.description || "";
            clone.querySelector(".product-price").textContent = product.price;

            const stockEl = clone.querySelector(".product-stock");
            if (product.is_available && product.quantity > 0) {
                stockEl.textContent = "Stock : " + product.quantity;
            } else {
                stockEl.textContent = "Indisponible";
            }

            const editBtn = clone.querySelector(".edit-btn");
            editBtn.addEventListener("click", () => {
                startEditing(product);
            });

            const deleteBtn = clone.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteProduct(product.id, product.name);
            });

            productsList.appendChild(clone);
        }

        updateUIByRole();
    } catch (error) {
        productsError.textContent = error.message;
    }
}

function startEditing(product) {
    editingProductId = product.id;

    document.getElementById("product-name").value = product.name;
    document.getElementById("product-description").value = product.description || "";
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-quantity").value = product.quantity;
    document.getElementById("product-available").checked = product.is_available;

    formTitle.textContent = "Modifier le produit";
    formSubmitBtn.textContent = "Modifier";
    cancelEditBtn.hidden = false;
    productFormError.textContent = "";

}

function resetForm() {
    editingProductId = null;
    productForm.reset();

    formTitle.textContent = "Ajouter un produit";
    formSubmitBtn.textContent = "Ajouter";
    cancelEditBtn.hidden = true;
    productFormError.textContent = "";
}

cancelEditBtn.addEventListener("click", () => {
    resetForm();
});

productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    productFormError.textContent = "";

    const productData = {
        name: document.getElementById("product-name").value.trim(),
        description: document.getElementById("product-description").value.trim() || null,
        price: parseFloat(document.getElementById("product-price").value),
        quantity: parseInt(document.getElementById("product-quantity").value, 10),
        is_available: document.getElementById("product-available").checked
    };

    try {
        if (editingProductId === null) {
            await apiRequest("/products", "POST", productData);
        } else {
            await apiRequest("/products/" + editingProductId, "PUT", productData);
        }

        resetForm();
        loadProducts();
    } catch (error) {
        productFormError.textContent = error.message;
    }
});

async function deleteProduct(productId, productName) {
    if (!confirm("Supprimer le produit ' " + productName + " ' ?")) {
        return;
    }

    try {
        await apiRequest("/products/" + productId, "DELETE");

        if (editingProductId === productId) {
            resetForm();
        }

        loadProducts();
    } catch (error) {
        productsError.textContent = error.message;
    }
}

loadProducts();