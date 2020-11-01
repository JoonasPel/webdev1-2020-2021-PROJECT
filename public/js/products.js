/**
 * Uses getJSON() to fetch all products from backend and lists them.
 */

const template = document.getElementById('product-template');

getJSON("/api/products").then(data => {
    for (const product of data) {
        listProductHTML(product);
    }
});

const listProductHTML = (product) => {
    //clone template
    const clone = template.content.cloneNode(true);

    //div
    clone.querySelector(".item-row").id = `product-${product._id}`;

    //name
    clone.querySelector("h3").textContent = product.name;
    clone.querySelector("h3").id = `name-${product._id}`;

    //description
    clone.querySelectorAll("p")[0].textContent = product.description;
    clone.querySelectorAll("p")[0].id = `description-${product._id}`;
    //price
    clone.querySelectorAll("p")[1].textContent = product.price;
    clone.querySelectorAll("p")[1].id = `price-${product._id}`;
    //buttons
    clone.querySelectorAll("button")[0].id = `add-to-cart-${product._id}`;

    //append to product list
    document.getElementById("products-container").appendChild(clone);
};