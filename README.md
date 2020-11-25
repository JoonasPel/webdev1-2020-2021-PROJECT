# Group 

Member1:  Joona Pelttari, joonas.pelttari@tuni.fi, 274830
resposible for: Lead developer, complex coding tasks

Member2: Tatu-Pekka Heikkilä, tatu-pekka.heikkila@tuni.fi, 439530
resposible for: Assisting developer



# WebDev1 coursework assignment

A web shop with vanilla HTML, CSS.


### The project structure

```
.
├── index.js                --> startup functions to webshop
├── package.json            --> project dependecies and metadata
├── routes.js               --> responsible for routing requests
├── auth                     
│   └──  auth.js            --> user authentication services and funcions
├── controllers              
│   └── users.js            --> controller for user
│   └── orders.js           --> controller for order
│   └── products.js         --> controller for product
├── models                   
│   └── db.js               --> MongoDB connection functions
│   └── order.js            --> MongoDB model for order documents
│   └── product.js          --> MongoDB model for product documents
│   └── user.js             --> MongoDB model for user documents
├── public                  --> all materials that client can achieve 
│   ├── img                 --> images
│   ├── js                  --> different page functions
│   │    ├── adminUsers.js  --> functions for admin in users-page
│   │    ├── cart.js        --> cart functions
│   │    ├── products.js    --> product page functions
│   │    ├── register.js    --> register user function
│   │    └── utils.js       --> utility functions for all pages
│   └── css                 --> stylsheet
├── utils                   
│   ├── render.js           --> rendering functions
│   ├── requestUtils.js     --> request handler functions
│   └── reponseUtils.js     --> response handler functions
└── test                    --> tests
│   ├── auth                --> authentication testers
│   ├── controllers         --> controllers testing
└── └── own                 --> own issues tester


## The architecture 

![UML Image of site structure](docs/webdev1_uml.png "Webshop UML")

### Pages and navigation
Customer user needs to have "Profile" or similar page to view own orders and change his/her user information.

Admin user needs to have "Admin functionalities" or similar page to:
- view all orders and possibility to drill down into one order
- view all users and possibility to drill down into one user and modify it
- view all products and possibility to drill down into one product and modify it
- add new user with admin rights
- add new product 

### Data models
There are differen MongoDB models for database, order, product and user.

## Tests and documentation

TODO: Links to at least 10 of your group's GitLab issues, and their associated Mocha tests and test files.

## Security concerns

TODO: list the security threats represented in the course slides.
Document how your application protects against the threats.
You are also free to add more security threats + protection here, if you will.

