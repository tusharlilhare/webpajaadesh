var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
var cors = require("cors");
var session = require("express-session");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost:27017/logindb")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    items: [{ name: String, price: Number }],
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

app.post("/book-order", async (req, res) => {
    try {
        const { name, email, phone, items } = req.body;
        const newOrder = new Order({ name, email, phone, items });
        await newOrder.save();
        console.log("✅ Order Saved:", newOrder);
        res.json({ message: "Order booked successfully!" });
    } catch (error) {
        console.error("❌ Error Booking Order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
});
