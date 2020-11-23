const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Internal schema for products inside Order
const orderedItemSchema = new Schema({
    product: {
        _id: {
            type: String,
            required: true           
        },
        name: {
            type: String,
            required: true
        },
        price : {
            type: Number,
            min: 0,
            required: true
        },
        description: {
            type: String
        },
        required: true
    },
    quantity: {
        type: Number,
        min: 1,
        required: true
    }
});


const orderSchema = new Schema({
    customerId: {
        type: String,
        required: true,
    },
    items: [orderedItemSchema]
});

// Omit the version key when serialized to JSON
OrderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;