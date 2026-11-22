const productsList = document.getElementById("products-list");
const productsError = document.getElementById("products-error");
const productTemplate = document.getElementById("product-template");

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

            productsList.appendChild(clone);
        }

        updateUIByRole();
    } catch (error) {
        productsError.textContent = error.message;
    }
}

loadProducts();