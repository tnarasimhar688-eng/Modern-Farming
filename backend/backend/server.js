const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* DATABASE */

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Database Error:", err));


/* FARMER MODEL */

const farmerSchema = new mongoose.Schema({
    farmerId: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    mobile: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

const Farmer = mongoose.model("Farmer", farmerSchema);


/* HOME */

app.get("/", (req, res) => {
    res.json({
        message: "🌾 Modern Farming Backend is Running"
    });
});


/* REGISTER */

app.post("/api/register", async (req, res) => {

    try {

        const {
            farmerId,
            name,
            email,
            mobile,
            password
        } = req.body;

        if (!farmerId || !name || !email || !mobile || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const existingFarmer = await Farmer.findOne({
            $or: [
                { farmerId },
                { email }
            ]
        });

        if (existingFarmer) {
            return res.status(409).json({
                message: "Farmer ID or Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const farmer = new Farmer({
            farmerId,
            name,
            email,
            mobile,
            password: hashedPassword
        });

        await farmer.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


/* LOGIN */

app.post("/api/login", async (req, res) => {

    try {

        const {
            farmerId,
            email,
            password
        } = req.body;

        const farmer = await Farmer.findOne({
            farmerId,
            email
        });

        if (!farmer) {
            return res.status(401).json({
                message: "Invalid login details"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            farmer.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid login details"
            });
        }

        const token = jwt.sign(
            {
                farmerId: farmer.farmerId,
                name: farmer.name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Login successful",
            token,
            farmer: {
                farmerId: farmer.farmerId,
                name: farmer.name,
                email: farmer.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


/* AUTH MIDDLEWARE */

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = user;

        next();

    } catch {

        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
}


/* PROTECTED PROFILE */

app.get("/api/profile", authenticateToken, async (req, res) => {

    const farmer = await Farmer.findOne({
        farmerId: req.user.farmerId
    }).select("-password");

    if (!farmer) {
        return res.status(404).json({
            message: "Farmer not found"
        });
    }

    res.json(farmer);
});


/* SERVER */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
