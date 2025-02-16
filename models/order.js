const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: String,
    name: String,
    username: String,
    firstCurrency: String,
    amount: Number,
})

module.exports = mongoose.model("Order", orderSchema);