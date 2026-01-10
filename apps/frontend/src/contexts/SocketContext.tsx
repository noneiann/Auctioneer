"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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

	useEffect(() => {
		// Get auth token from localStorage
		const getAuthToken = (): string | null => {
			try {
				const authStorage = localStorage.getItem("auth-storage");
				if (authStorage) {
					const parsed = JSON.parse(authStorage);
					return parsed.state?.token || null;
				}
				return null;
			} catch (error) {
				console.error("Error parsing auth storage:", error);
				return null;
			}
		};

		const token = getAuthToken();

		if (!token) {
			console.log("No auth token found, skipping socket connection");
			return;
		}

		// Create socket connection
		const socketInstance = io("http://localhost:4000", {
			auth: {
				token,
			},
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

		// Cleanup on unmount
		return () => {
			socketInstance.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
}
