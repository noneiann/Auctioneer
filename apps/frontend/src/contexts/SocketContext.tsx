"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/AuthStore";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const token = useAuthStore((state) => state.token);
	const socketUrl =
		process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

	useEffect(() => {
		if (!token) {
			console.log("No auth token found, skipping socket connection");
			setSocket(null);
			setIsConnected(false);
			return;
		}

		// Create socket connection
		const socketInstance = io(socketUrl, {
			auth: {
				token,
			},
			transports: ["polling", "websocket"],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5,
		});

		socketInstance.on("connect", () => {
			console.log("WebSocket connected:", socketInstance.id);
			setIsConnected(true);
		});

		socketInstance.on("disconnect", (reason) => {
			console.log("WebSocket disconnected:", reason);
			setIsConnected(false);
		});

		socketInstance.on("connect_error", (error) => {
			console.error("WebSocket connection error:", error.message);
			setIsConnected(false);
		});

		setSocket(socketInstance);

		// Cleanup on unmount or when token/url changes
		return () => {
			socketInstance.disconnect();
		};
	}, [token, socketUrl]);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
}
