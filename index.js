
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Session Middleware (Login state save karne ke liye)
app.use(
    session({
        secret: "mySecretKey", // 🔑 Secret key (isse secure rakhna)
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 60 * 1000, secure: false }, // secure:true in production
    })
);

// ✅ Serve Static Files (Public Folder)
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB Connection
mongoose
    .connect("mongodb://localhost:27017/logindb", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB: logindb"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ User Schema & Model
const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    phno: String,
    gender: String,
    password: String,
});

const User = mongoose.model("storedata", userSchema);

// ✅ Contact Schema & Model
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
    submittedAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("contacts", contactSchema);

// ✅ Order Schema & Model
const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    items: [{ name: String, price: Number }],
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

// ✅ Authentication Middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.redirect("/login.html");
    }
}

// ✅ Serve Pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));

// 🔒 Protected Routes (Sirf login hone par access milenge)
app.get("/menu", isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "public", "menu.html")));
app.get("/contact", isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "public", "contact.html")));
app.get("/book", isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "public", "book.html")));

// ✅ Sign-up Route
app.post("/sign_up", async (req, res) => {
    try {
        const { name, age, email, phno, gender, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, age, email, phno, gender, password: hashedPassword });
        await newUser.save();
        console.log("✅ Registration Successful");
        return res.redirect("/login.html");
    } catch (error) {
        console.error("❌ Error Registering User:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            console.log("✅ Login Successful:", user.email);
            return res.redirect("/menu");
        } else {
            console.log("❌ Invalid Credentials");
            return res.status(401).send("Invalid Email or Password");
        }
    } catch (error) {
        console.error("❌ Error Logging In:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

// ✅ Contact Form Route
app.post("/contact", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        console.log("✅ Contact Form Submitted:", newContact);
        res.status(200).send("Message Saved!");
    } catch (error) {
        console.error("❌ Error Saving Contact:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Order Booking Route
app.post("/book-order", async (req, res) => {
    try {
        const { name, email, phone, items } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Items cannot be empty" });
        }
        const newOrder = new Order({ name, email, phone, items });
        await newOrder.save();
        console.log("✅ Order Saved:", newOrder);
        res.json({ message: "Order booked successfully!" });
    } catch (error) {
        console.error("❌ Error Booking Order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ 404 Page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
});
