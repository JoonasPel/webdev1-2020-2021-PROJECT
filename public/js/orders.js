const template = document.getElementById('product-template');

/**
 * Get orders from server
 */
getJSON("/api/orders").then(data => {
    data.forEach(addOrder);
});

/**
 * Add orders to DOM
 * 
 * @param {JSON} oneOrder order object with products inside
 */
const addOrder = (oneOrder) => {
    //console.log(oneOrder);

    //add line to separate orders
    let line = document.createElement("hr");
    document.getElementById("orders-container").appendChild(line);

    //add orderId and customerId
    let order_title = document.createElement("h3");
    order_title.textContent = `OrderId: ${oneOrder._id} customerId: ${oneOrder.customerId}`;
    document.getElementById("orders-container").appendChild(order_title);

    // Loop items(products) in one order and add to html
    oneOrder.items.forEach(listOrderHTML);
}

/**
 * Add product details to DOM
 * 
 * @param {JSON} productDetails  item/product to insert to page
 */
const listOrderHTML = (productDetails) => {

    const product = productDetails.product;
    const productID = product._id;

    //clone template
    const clone = template.content.cloneNode(true);

    //div
    clone.querySelector(".item-row").id = `product-${productID}`;

    //name
    clone.querySelector("h3").textContent = product.name;
    clone.querySelector("h3").id = `name-${productID}`;

    //price
    clone.querySelectorAll("p")[0].textContent = `Price: ${product.price}`;
    clone.querySelectorAll("p")[0].id = `price-${productID}`;

    //amount
    clone.querySelectorAll("p")[1].textContent = `Quantity: ${productDetails.quantity}x`;
    clone.querySelectorAll("p")[1].id = `amount-${productID}`;

    //append to order list
    document.getElementById("orders-container").appendChild(clone);
};