/**
 * TODO: 8.3 List all users (use <template id="user-template"> in users.html)
 *       - Each user should be put inside a clone of the template fragment
 *       - Each individual user HTML should look like this
 *         (notice the id attributes and values, replace "{userId}" with the actual user id)
 *
 *         <div class="item-row" id="user-{userId}">
 *           <h3 class="user-name" id="name-{userId}">Admin</h3>
 *           <p class="user-email" id="email-{userId}">admin@email.com</p>
 *           <p class="user-role" id="role-{userId}">admin</p>
 *           <button class="modify-button" id="modify-{userId}">Modify</button>
 *           <button class="delete-button" id="delete-{userId}">Delete</button>
 *         </div>
 *
 *       - Each cloned template fragment should be appended to <div id="users-container">
 *       - Use getJSON() function from utils.js to fetch user data from server
 **/
const template = document.getElementById('user-template');

getJSON("/api/users").then(data => {
    for (const user of data) {
        listUserHTML(user);
    }
});

const listUserHTML = (user) => {
    //clone template
    const clone = template.content.cloneNode(true);

    //div
    clone.querySelector(".item-row").id = `user-${user._id}`;

    //name
    clone.querySelector("h3").textContent = user.name;
    clone.querySelector("h3").id = `name-${user._id}`;

    //email
    clone.querySelectorAll("p")[0].textContent = user.email;
    clone.querySelectorAll("p")[0].id = `email-${user._id}`;
    //role
    clone.querySelectorAll("p")[1].textContent = user.role;
    clone.querySelectorAll("p")[1].id = `role-${user._id}`;
    //buttons
    clone.querySelectorAll("button")[0].id = `modify-${user._id}`;
    clone.querySelectorAll("button")[1].id = `delete-${user._id}`;

    //append to contacts
    document.getElementById("users-container").appendChild(clone);
};


/**
 *
 * TODO: 8.5 Updating/modifying and deleting existing users
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 *       - Use deleteResource() function from utils.js to delete users from server
 *       - Clicking "Delete" button of a user will delete the user and update the listing accordingly
 *       - Clicking "Modify" button of a user will use <template id="form-template"> to
 *         show an editing form populated with the values of the selected user
 *       - The edit form should appear inside <div id="modify-user">
 *       - Afted successful edit of user the form should be removed and the listing updated accordingly
 *       - You can use removeElement() from utils.js to remove the form.
 *       - Remove edit form from the DOM after successful edit or replace it with a new form when another
 *         user's "Modify" button is clicked. There should never be more than one form visible at any time.
 *         (Notice that the edit form has an id "edit-user-form" which should be unique in the DOM at all times.)
 *       - Also remove the edit form when a user is deleted regardless of which user is deleted.
 *       - Modifying a user successfully should show a notification message "Updated user {User Name}"
 *       - Deleting a user successfully should show a notification message "Deleted user {User Name}"
 *       - Use createNotification() function from utils.js to create notifications
 */
//listen for button clicks
document.addEventListener('click', function(e) {
    //get clicked element id and split it into array
    let buttonId = e.target.id;
    const actionUser = buttonId.split('-');

    //catch clicking other than button elements
    if (!(actionUser[0] === 'delete' || actionUser[0] === 'modify')) {
        //reset buttonId to nothing
        return buttonId = '';

    }
    //use array to decide function
    else if (actionUser[0] === 'delete') {
        deleteUser(actionUser);

    } else if (actionUser[0] === 'modify') {
        //console.log('modify')
        //get user info from api by userid
        getJSON(`/api/users/${actionUser[1]}`).then(data => {
            modifyUser(data);
        });

    }
}, false);


window.modifyUser = function (user) {
    const formtemplate = document.getElementById('form-template');
    document.getElementById("modify-user").innerHTML = '';
    //console.log(user)
    const cloneForm = formtemplate.content.cloneNode(true);
    //form id
    cloneForm.getElementById("edit-user-form").id = `edit-user-${user._id}`;
    //header
    cloneForm.querySelector("h2").textContent = `Modify user${user.name}`;
    //
    const form = cloneForm.querySelectorAll("input");
    console.log(user);
    //id, name, email
    form[0].value = user._id;
    form[1].value = user.name;
    form[1].removeAttribute("disabled");
    form[2].value = user.email;
    form[2].removeAttribute("disabled");


    //append to contacts
    document.getElementById("modify-user").appendChild(cloneForm);

    //listen for submit button
    const updateForm = document.querySelector('form');
    console.log(updateForm[3].value);

    //handle Update-button click
    updateForm.addEventListener('submit', function(event) {
        //cancel the default action
        event.preventDefault();
        //parse data to server
        const userData = {
            "_id": updateForm[0].value,
            "name": updateForm[1].value,
            "email": updateForm[2].value,
            "password": user.password,
            "role": updateForm[3].value
        };
        //call updateuser function
        updateUser(userData);

    });

};

/*
 *Not working yet. Todo: postOrPutJSON don't modify other infos than role. Should it be changed or used some other function?
 * 
 */
window.updateUser = async function (userData) {
    //use postOrPutJSON function to update user details
    const response = await postOrPutJSON(`/api/users/${userData._id}`, "PUT", userData);
    //if succesfull
    if (response.status === 200) {
        // update listing, show notify and hide "modify-user" element.
        response.data.then((data) => {

            createNotification(`Updated user ${data.name}`, 'notifications-container');
            //name update
            document.getElementById(`name-${data._id}`).textContent = data.name;
            //email update
            document.getElementById(`email-${data._id}`).textContent = data.email;
            //role update
            document.getElementById(`role-${data._id}`).textContent = data.role;

            //remove update form
            document.getElementById(`edit-user-${data._id}`).remove();
        });
    } else {
        createNotification(response.status, 'notifications-container', false);
    }
};

window.deleteUser = async function(actionUser) {
    try {
        //try to delete user from server database, throws if unsuccessfull
        const resp = await deleteResourse(`/api/users/${actionUser[1]}`);
        //remove div from html
        document.getElementById(`user-${actionUser[1]}`).remove();
        //show notification to user
        createNotification(`Deleted user ${resp.name}`, 'notifications-container');
    } catch (error) {
        //deleteResourse() did throw, deleting user was unsuccessful
        createNotification(error, 'notifications-container', false);
    }

};