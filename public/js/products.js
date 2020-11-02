/**
 * Uses getJSON() to fetch all products from backend and lists them.
 */

const template = document.getElementById('product-template');


getJSON("/api/products").then(data => {
    console.log(data)
    for (const product of data) {
        console.log(product)
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

//listen for button clicks
document.addEventListener('click', function(e) {

    //get clicked element id and split it into array
    let buttonId = e.target.id;
    const clickedProduct = buttonId.split('-');

    console.log(clickedProduct[0])

    //catch clicking other than button elements
    if (!(clickedProduct[0] === 'add')) {
        //reset buttonId to nothing if other than button click
        return buttonId = '';

    } else {
        //check if product is already in cart
        if (sessionStorage.getItem(clickedProduct[3]) !== null) {
            let count = Number(sessionStorage.getItem(clickedProduct[3]))
                //increase count
            sessionStorage.setItem(clickedProduct[3], count + 1)

        } else {
            sessionStorage.setItem(clickedProduct[3], 1);
            //TODO add notification
            //createNotification('Added ' + ' to cart!', 'notifications-container')
        }
    }
}, false);