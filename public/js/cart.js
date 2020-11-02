/**
 * Cart functions
 */
const template = document.getElementById('cart-item-template');


/**
 * Get items from sessionstorage
 */
const getAllProductsFromCart = () => {
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

/**
 * 
 * @param {*} productDetails Object which should be inserted to page
 * @param {*} amount amount of products added to cart
 */
const generateDom = (productDetails, amount) => {
    let product_id = productDetails._id;
    //clone template
    const clone = template.content.cloneNode(true);
    //div
    clone.querySelector(".item-row").id = `product-${product_id}`;

    //name
    clone.querySelector("h3").textContent = productDetails.name;
    clone.querySelector("h3").id = `name-${product_id}`;

    //price
    clone.querySelectorAll("p")[0].textContent = productDetails.price;
    clone.querySelectorAll("p")[0].id = `price-${product_id}`;
    //amount
    clone.querySelectorAll("p")[1].textContent = amount + 'x';
    clone.querySelectorAll("p")[1].id = `amount-${product_id}`;

    //buttons
    clone.querySelectorAll("button")[0].id = `plus-${product_id}`;
    clone.querySelectorAll("button")[1].id = `minus-${product_id}`;

    //append to product list
    document.getElementById("cart-container").appendChild(clone);

}


//listen for button clicks
document.addEventListener('click', function(e) {
    //get clicked element id and split it into array
    let buttonId = e.target.id;
    const actionCart = buttonId.split('-');
    let command = actionCart[0];
    let itemId = actionCart[1];
    
    //use array to decide function
    if (command === 'minus') {
        decreaseProductCount(itemId);
    } else if (command === 'plus') {
        increaseProductCount(itemId);
    } else if (command === 'place') {
        //clear shopping cart from UI and session storage
        clearCart();
        createNotification('Succesfully created an order!', 'notifications-container');
    }

}, false);

function decreaseProductCount(itemId) {
    //amount of items 
    count = Number(sessionStorage.getItem(itemId));
    //decrease amount
    count--;
    //if amount 0 remove from sessionstorage and from page
    if (count == 0) {
        document.getElementById('product-' + itemId).remove();
        sessionStorage.removeItem(itemId);
        return;
    }
    //update session storage
    sessionStorage.setItem(itemId, count);
    //update amount in page
    document.getElementById(`amount-${itemId}`).innerText = count + 'x';

}

function increaseProductCount(itemId) {
    //amount of items 
    count = Number(sessionStorage.getItem(itemId));
    //update session storage with increased amount
    sessionStorage.setItem(itemId, ++count);
    //update amount in page, count is increased above
    document.getElementById(`amount-${itemId}`).innerText = count + 'x';
}

function clearCart() {
    //clears session storage
    sessionStorage.clear();
    //clears UI, all items have class 'item-row'
    document.querySelectorAll('.item-row').forEach(item => item.remove());
}

getAllProductsFromCart();
