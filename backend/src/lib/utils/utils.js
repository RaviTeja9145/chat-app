import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
	const generatedToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	res.cookie("jwt", generatedToken, {
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: "Strict",
		secure: process.env.NODE_ENV != "development",
	});
};
