/**
 * Cart functions
 */
const template = document.getElementById('cart-item-template');

/**
 * Get items from sessionstorage
 */
const cartItems = () => {
    let keys = Object.keys(sessionStorage);
    console.log(keys)
    for (key in keys) {
        generateProductIntoCart(keys[key], sessionStorage.getItem(keys[key]));
    }
}


/**
 * Get item details from API
 * @param {*} product Product ID
 * @param {*} count count of products in cart
 */
const generateProductIntoCart = (product, count) => {
    getJSON("/api/products/" + product).then(data => {
        generateDom(data, count);
    })
}


const generateDom = (productDetails, amount) => {
    //clone template
    const clone = template.content.cloneNode(true);
    //div
    clone.querySelector(".item-row").id = `product-${productDetails._id}`;

    //name
    clone.querySelector("h3").textContent = productDetails.name;
    clone.querySelector("h3").id = `name-${productDetails._id}`;

    //price
    clone.querySelectorAll("p")[0].textContent = productDetails.price;
    clone.querySelectorAll("p")[0].id = `price-${productDetails._id}`;
    //amount
    clone.querySelectorAll("p")[1].textContent = amount;
    clone.querySelectorAll("p")[1].id = `amount-${productDetails._id}`;

    //append to product list
    document.getElementById("cart-container").appendChild(clone);

}
cartItems();