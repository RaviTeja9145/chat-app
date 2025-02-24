import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUsersForSidebar = (req, res) => {
	try {
		const loggedInuserId = req.user._id;
		// all users except the current user
		const filteredUsers = User.find({ _id: { $ne: loggedInuserId } }).select(
			"-password"
		);
		res.status(200).json(filteredUsers);
	} catch (error) {
		console.log("Error on getUsersForSidebar Controller", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const myId = req.user._id;
		// messages from me to otherUser or from otherUser to me
		const messages = await Message.find({
			$or: [
				{ senderId: myId, receiverId: userToChatId },
				{ senderId: userToChatId, receiverId: myId },
			],
		});
		res.status(200).json(messages);
	} catch (error) {
		console.log("Error on getMessages Controller", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const sendMessage = async (req, res) => {
	try {
		const { id: receiverId } = req.params;
		const { text, image } = req.body;
		const senderId = req.user._id;
		let imageUrl;
		if (image) {
			const uplodadResponse = await cloudinary.uploader.upload(image);
			imageUrl = uplodadResponse.secure_url;
		}
		//sending msg to a particular user
		const newMessage = new Message({
			senderId,
			receiverId,
			text,
			imageUrl,
		});
		await newMessage.save();
		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error on sendMessage Controller", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
