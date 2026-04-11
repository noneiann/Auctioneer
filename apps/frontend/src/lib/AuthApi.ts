import { ApiRequest, ApiResponse, User } from "@auctioneer/types";

type LoginBody = { email: string; password: string };
type RegisterBody = {
	email: string;
	username: string;
	password: string;
	firstName: string;
	lastName: string;
};

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function login(
	email: string,
	password: string
): Promise<ApiResponse<{ user: User; token: string }>> {
	const req: ApiRequest<LoginBody> = {
		url: `${API_BASE_URL}/auth/login`,
		method: "POST",
		body: { email, password },
		headers: { "Content-Type": "application/json" },
	};

	const res = await fetch(req.url, {
		method: req.method,
		headers: req.headers,
		body: JSON.stringify(req.body),
	});
	const data: ApiResponse<{ user: User; token: string }> = await res.json();
	if (!res.ok) {
		const message = typeof data.data === "string" ? data.data : "Login failed";
		throw new Error(message);
	}
	return data;
}

// You can add more API functions here, e.g. register, logout, etc.
async function register(
	body: RegisterBody
): Promise<ApiResponse<{ user: User; token: string }>> {
	const res = await fetch(`${API_BASE_URL}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.data || "Registration failed");
	return data;
}
const AuthApi = {
	login,
	register,
};

export default AuthApi;
