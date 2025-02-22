import { generateToken } from "../lib/utils/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
	const { fullName, email, password } = req.body;
	try {
		if (!fullName || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: "Password must be atleast 6 characters" });
		}
		const user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: "Email already exists" });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = new User({
			fullName,
			email,
			password: hashedPassword,
		});
		if (newUser) {
			generateToken(newUser._id, res);
			await newUser.save();
			return res.status(201).json({
				id: newUser._id,
				fullName,
				email,
				profiePic: newUser.profilePic,
			});
		} else {
			return res.status(400).json({ message: "Invalid User Data!" });
		}
	} catch (error) {
		console.log("Error on signup Controller", error);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		if (!email || !password) {
			res.status(400).json({ message: "Please Enter Both Email and password" });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid Credentials" });
		}
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid Credentials" });
		}
		generateToken(user._id, res);
		res.status(200).json({
			id: user._id,
			fullName: user.fullName,
			email,
			profiePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error on Login Controller", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.json({ message: "Logout Successful" });
	} catch (error) {
		console.log("Error in Logout Controller");
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const { profiePic } = req.body;
		const userId = req.user._id;
		if (!profiePic) {
			return res
				.status(400)
				.json({ message: "Please upload a profile picture" });
		}
		const uplodadResponse = await cloudinary.uploader.upload(profiePic);
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ profilePic: uplodadResponse.secure_url },
			{ new: true }
		);
		res.status(200).json(updatedUser);
	} catch (error) {
		console.log("Error in updateProfile Controller");
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const checkAuth = (req, res) => {
	try {
		res.status(200).json(req.user);
	} catch (error) {
		console.log("Error in checkAuth Controller");
		res.status(500).json({ message: "Internal Server Error" });
	}
};
