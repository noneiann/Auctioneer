import { Router, Request, Response } from "express";

export interface ApiResponse<T> {
	success: boolean;
	data: T;
}

export interface ApiRequest<T = any> {
	url: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: T;
	headers?: Record<string, string>;
}

export interface RegisterRequest extends Request {
	body: {
		email: string;
		username: string;
		password: string;
		firstName: string;
		lastName: string;
	};
}

export interface LoginRequest extends Request {
	body: {
		email: string;
		password: string;
	};
}

export interface GetUserRequest extends Request {
	params: {
		id: string;
	};
}

export interface AuthenticatedRequest extends Request {
	user?: JwtPayloadUser;
}

export interface JwtPayloadUser {
	userId: string;
	email: string;
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	username: string;
	permission: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Auction {
	id: string;
	ownerId: string;
	title: string;
	description: string;
	startPrice: number;
	currentBid: number;
	startingBid: number;
	endTime: Date;
	createdAt: Date;
	updatedAt: Date;
	itemId: string;
}

// Payload for creating an auction
export interface CreateAuctionPayload {
	ownerId: string; // matches ownerId
	itemId: string; // connect to an existing item
	startingBid: number; // matches startingBid
	startTime: Date; // pass a real Date
	endTime: Date; // pass a real Date
}
// Payload for updating an auction
export interface UpdateAuctionPayload {
	title?: string;
	description?: string;
	startPrice?: number;
	endTime?: string;
	startingBid?: number;
}

// Item types and statuses
export type ItemType = "AUCTION" | "DIRECT" | "BARTER";
export type ItemStatus = "AVAILABLE" | "SOLD" | "REMOVED"; // Add based on your Prisma enum

export interface Item {
	id: string;
	name: string;
	description: string;
	imageUrl: string[];
	type: ItemType;
	price?: number;
	status: ItemStatus;
	createdAt: Date;
	updatedAt: Date;
	ownerId: string;
}
export interface CreateItemPayload {
	name: string;
	description: string;
	imageUrl: string[];
	type: ItemType;

	price?: number;
	ownerId: string;
}
