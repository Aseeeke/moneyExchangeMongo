require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const Order = require("./models/order");

const mongoose = require('mongoose');
mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connected to mongodb')
})

app.post("/api/orders", async (req, res) => {
    const newOrder = new Order({
        userId: req.body.userId,
        name: req.body.name,
        username: req.body.username,
        firstCurrency: req.body.firstCurrency,
        amount: req.body.amount,
    });
    try {
        await newOrder.save();
        res.status(201).json(newOrder);
    }
    catch(error) {
        res.status(400).json(error);
    }

})

app.put("/api/orders/:id", async (req, res) => {
    const id = req.params.id;
    const {amount, userId} = req.body;

    try {
        await Order.findByIdAndUpdate(id, {
                $set: {amount: amount}
            },
            {
                new: true,
                runValidators: true
            })
        res.status(201)
    }
    catch(error) {
        res.status(400).json(error);
    }
})

app.delete("/api/orders/:id/:userId", async (req, res) => {
    const orderId = req.params.id;
    const userId = req.params.userId;

    try {
        const order = await Order.findById(orderId);
        if(order.userId === userId){
            await Order.findByIdAndDelete(orderId);
            res.status(200).json(order)
        }
        res.status(404).end()
    }
    catch (error) {
        res.status(400).json(error);
    }
})
app.get("/api/orders/:userId", async (req, res) => {
    console.log(req.params)
    const result = await Order.find({userId: req.params.userId })
    const filteredResults = result.map(order => {
        return {
            _id: order._id,
            currency: order.firstCurrency,
            amount: order.amount
        }
    })
    res.json(filteredResults)
})
app.get("/api/orders/:userId/:currency/:amount", async (req, res) => {
    const currency = req.params.currency;
    const amount = Number(req.params.amount);
    const userId = req.params.userId;

    console.log(req.params)

    const result = await Order.find({
        userId: {$ne: userId},
        firstCurrency: currency,
        amount: {$gte: amount}
    })
    res.json(result);
})

const PORT = 3001

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})