/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */
const form = document.querySelector("#register-form");
const name_ = document.querySelector('#name');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const passwordConfirmation = document.querySelector('#passwordConfirmation');


form.addEventListener('submit', async function(event) {
    //cancel the default action
    event.preventDefault();


    //Prevent registration if passwords don't match
    if (password.value !== passwordConfirmation.value) {
        createNotification("Passwords do not match!", "notifications-container", false);      
    } else {
        const userData = {"name": name_.value, "email": email.value, "password": password.value};
        const response = await postOrPutJSON('/api/register', 'POST', userData);

        if(response.status === 201) {
            //registration successful
            createNotification("Successful", "notifications-container");
            form.reset();  
        } else {
            //registration NOT successful
            createNotification("Not Successful", "notifications-container", false);
        }      
    }
});