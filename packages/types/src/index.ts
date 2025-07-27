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
