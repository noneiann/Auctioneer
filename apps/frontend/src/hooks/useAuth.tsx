import { useAuthStore } from "@/stores/AuthStore";

export function useAuth() {
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);
	const setAuth = useAuthStore((state) => state.setAuth);
	const logout = useAuthStore((state) => state.logout);

	return {
		user,
		token,
		setAuth,
		logout,
		isAuthenticated: !!token,
	};
}
