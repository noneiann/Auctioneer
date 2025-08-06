import prisma from "@auctioneer/db";
import {
	ApiResponse,
	GetUserRequest,
	RegisterRequest,
	LoginRequest,
	JwtPayloadUser,
} from "@auctioneer/types/src";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

export const login = async (email: string, password: string) => {
	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		throw new Error("Invalid password");
	}

	const { password: _, ...userWithoutPassword } = user;
	return userWithoutPassword;
};

export const register = async (
	email: string,
	username: string,
	password: string,
	firstName: string,
	lastName: string
) => {
	const existingUser = await prisma.user.findUnique({
		where: { email, username },
	});

	if (existingUser) {
		throw new Error("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = await prisma.user.create({
		data: {
			email,
			username,
			password: hashedPassword,
			firstName,
			lastName,
		},
	});
	if (!newUser) {
		throw new Error("User registration failed");
	}
	return newUser;
};

export default { login, register };
