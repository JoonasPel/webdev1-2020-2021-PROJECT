/**
 * Cart functions
 */
const template = document.getElementById('cart-item-template');


/**
 * Get items from sessionstorage
 */
const getAllProductsFromCart = () => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => generateProductIntoCart(key, sessionStorage.getItem(key)));
};


/**
 * Get item details from API
 * @param {*} product Product ID
 * @param {*} count count of products in cart
 */
const generateProductIntoCart = (product, count) => {
    getJSON(`/api/products/${product}`).then(data => {
        generateDom(data, count);
    });
};

/**
 * 
 * @param {*} productDetails Object which should be inserted to page
 * @param {*} amount amount of products added to cart
 */
const generateDom = (productDetails, amount) => {
    const productID = productDetails._id;
    //clone template
    const clone = template.content.cloneNode(true);
    //div
    clone.querySelector(".item-row").id = `product-${productID}`;

    //name
    clone.querySelector("h3").textContent = productDetails.name;
    clone.querySelector("h3").id = `name-${productID}`;

    //price
    clone.querySelectorAll("p")[0].textContent = productDetails.price;
    clone.querySelectorAll("p")[0].id = `price-${productID}`;

    //amount
    clone.querySelectorAll("p")[1].textContent = `${amount}x`;
    clone.querySelectorAll("p")[1].id = `amount-${productID}`;

    //buttons
    clone.querySelectorAll("button")[0].id = `plus-${productID}`;
    clone.querySelectorAll("button")[1].id = `minus-${productID}`;

    //append to product list
    document.getElementById("cart-container").appendChild(clone);

};


//listen for button clicks
document.addEventListener('click', function(e) {
    //get clicked element id and split it into array
    const buttonId = e.target.id;
    const actionCart = buttonId.split('-');
    const command = actionCart[0];
    const itemId = actionCart[1];

    //use array to decide function
    if (command === 'minus') {
        decreaseProductCount(itemId);
    } else if (command === 'plus') {
        increaseProductCount(itemId);
    } else if (command === 'place') {
        //clear shopping cart from UI and session storage
        if (getSessionStorage().length === 0) {
            createNotification('No items in cart. Order not sent!', 'notifications-container', false);
            return;
        }
        generateOrder();
    }
    updateCartItemsCountInNavi();
}, false);

/**
 *  Decrease product count in sessionStorage
 * @param {*} itemId Item to decrease in sessionstorage
 */
const decreaseProductCount = (itemId) => {
    //amount of items 
    let count = Number(sessionStorage.getItem(itemId));
    //decrease amount
    count--;
    //if amount 0 remove from sessionstorage and from page
    if (count === 0) {
        document.getElementById(`product-${itemId}`).remove();
        sessionStorage.removeItem(itemId);
        return;
    }
    //update session storage
    sessionStorage.setItem(itemId, count);
    //update amount in page
    document.getElementById(`amount-${itemId}`).innerText = `${count}x`;

}

/**
 * Increase product count in sessionStorage
 * @param {*} itemId ItemId to increase in sessionStorage
 */
const increaseProductCount = (itemId) => {
    //amount of items 
    let count = Number(sessionStorage.getItem(itemId));
    //update session storage with increased amount
    sessionStorage.setItem(itemId, ++count);
    //update amount in page, count is increased above
    document.getElementById(`amount-${itemId}`).innerText = `${count}x`;
}

/**
 * Clear cart
 */
const clearCart = () => {
    //clears session storage
    sessionStorage.clear();
    //clears UI, all items have class 'item-row'
    document.querySelectorAll('.item-row').forEach(item => item.remove());
}

/**
 * Generate order from session storage
 */
const generateOrder = async() => {
    //get all products and amounts from sessionstorage
    const orderProducts = Object(sessionStorage);
    let postItems = JSON.parse('{ "items": [] }');
    //i to handle submitOrder logic
    let i = 0;
    Object.entries(orderProducts).forEach(([key, val]) =>
        getJSON(`/api/products/${key}`).then(data => {
            const amount = val;
            const item = {
                "product": { "_id": data._id, "name": data.name, "price": Number(data.price), "description": data.description },
                "quantity": Number(amount)
            }
            postItems['items'].push(item);
            i++
            //test if all products are inserted into postItems ready to save into DB
            if (orderProducts.length == i) {
                submitOrder(postItems);
            }
        })
    )
}

/**
 * Submit order to DB
 * @param {*} orderData Orderdata as JSON
 */
const submitOrder = async(orderData) => {
    //all needed functions

    const response = await postOrPutJSON('/api/orders', 'POST', orderData);
    if (response.status === 201) {
        clearCart();
        updateCartItemsCountInNavi();
        createNotification('Succesfully created an order!', 'notifications-container');
    } else {
        clearCart();
        createNotification('Order not created!', 'notifications-container', false)
    }

}

getAllProductsFromCart();