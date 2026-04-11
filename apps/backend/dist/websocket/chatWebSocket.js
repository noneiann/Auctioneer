"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = chatWebSocket;
const db_1 = __importDefault(require("@auctioneer/db"));
const typingUsers = new Map();
function chatWebSocket(io, socket) {
    const user = socket.data.user;
    // Join chat room
    socket.on("join_chat", (data) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { chatId } = data;
            const roomName = `chat:${chatId}`;
            socket.join(roomName);
            console.log(`User ${user === null || user === void 0 ? void 0 : user.email} joined chat ${chatId}`);
            // Send chat history to the user
            const messages = yield db_1.default.chatMessage.findMany({
                where: { conversationId: chatId },
                orderBy: { createdAt: "desc" },
                take: 50,
                include: {
                    sender: { select: { email: true } },
                },
            });
            const history = messages
                .slice()
                .reverse()
                .map((message) => ({
                id: message.id,
                chatId: message.conversationId,
                senderId: message.senderId,
                senderEmail: message.sender.email,
                content: message.content,
                createdAt: message.createdAt.toISOString(),
                read: message.read,
            }));
            socket.emit("chat_history", {
                chatId,
                messages: history,
                participantCount: ((_a = io.sockets.adapter.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.size) || 0,
            });
            // Notify others in the room
            socket.to(roomName).emit("user_joined_chat", {
                userId: user === null || user === void 0 ? void 0 : user.userId,
                username: user === null || user === void 0 ? void 0 : user.email,
                participantCount: ((_b = io.sockets.adapter.rooms.get(roomName)) === null || _b === void 0 ? void 0 : _b.size) || 0,
            });
        }
        catch (error) {
            console.error("Error joining chat:", error);
            socket.emit("error", { message: "Failed to join chat" });
        }
    }));
    // Leave chat room
    socket.on("leave_chat", (chatId) => {
        var _a;
        const roomName = `chat:${chatId}`;
        socket.leave(roomName);
        // Remove from typing users
        const typingSet = typingUsers.get(chatId);
        if (typingSet) {
            typingSet.delete((user === null || user === void 0 ? void 0 : user.userId) || "");
            if (typingSet.size === 0) {
                typingUsers.delete(chatId);
            }
        }
        console.log(`User ${user === null || user === void 0 ? void 0 : user.email} left chat ${chatId}`);
        // Notify others in the room
        socket.to(roomName).emit("user_left_chat", {
            userId: user === null || user === void 0 ? void 0 : user.userId,
            participantCount: ((_a = io.sockets.adapter.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.size) || 0,
        });
    });
    // Send message
    socket.on("send_message", (data) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { chatId, message } = data;
            if (!message || message.trim().length === 0) {
                socket.emit("message_error", { message: "Message cannot be empty" });
                return;
            }
            if (message.length > 1000) {
                socket.emit("message_error", {
                    message: "Message too long (max 1000 characters)",
                });
                return;
            }
            if (!(user === null || user === void 0 ? void 0 : user.userId) || !(user === null || user === void 0 ? void 0 : user.email)) {
                socket.emit("message_error", { message: "Unauthorized" });
                return;
            }
            const savedMessage = yield db_1.default.chatMessage.create({
                data: {
                    conversationId: chatId,
                    senderId: user.userId,
                    content: message.trim(),
                },
                include: {
                    sender: { select: { email: true } },
                },
            });
            const newMessage = {
                id: savedMessage.id,
                chatId: savedMessage.conversationId,
                senderId: savedMessage.senderId,
                senderEmail: savedMessage.sender.email,
                content: savedMessage.content,
                createdAt: savedMessage.createdAt.toISOString(),
                read: savedMessage.read,
            };
            // Broadcast to all users in chat room
            const roomName = `chat:${chatId}`;
            io.to(roomName).emit("new_message", newMessage);
            // Clear typing indicator for this user
            const typingSet = typingUsers.get(chatId);
            if (typingSet) {
                typingSet.delete((user === null || user === void 0 ? void 0 : user.userId) || "");
                socket.to(roomName).emit("stop_typing", {
                    userId: user === null || user === void 0 ? void 0 : user.userId,
                    typingUsers: Array.from(typingSet),
                });
            }
            console.log(`Message sent in chat ${chatId} by ${user === null || user === void 0 ? void 0 : user.email}`);
        }
        catch (error) {
            console.error("Error sending message:", error);
            socket.emit("message_error", { message: "Failed to send message" });
        }
    }));
    // Typing indicator
    socket.on("typing", (chatId) => {
        const roomName = `chat:${chatId}`;
        // Add user to typing set
        if (!typingUsers.has(chatId)) {
            typingUsers.set(chatId, new Set());
        }
        const typingSet = typingUsers.get(chatId);
        typingSet.add((user === null || user === void 0 ? void 0 : user.userId) || "");
        // Broadcast to others in the room
        socket.to(roomName).emit("user_typing", {
            userId: user === null || user === void 0 ? void 0 : user.userId,
            username: user === null || user === void 0 ? void 0 : user.email,
            typingUsers: Array.from(typingSet),
        });
    });
    // Stop typing indicator
    socket.on("stop_typing", (chatId) => {
        const roomName = `chat:${chatId}`;
        // Remove user from typing set
        const typingSet = typingUsers.get(chatId);
        if (typingSet) {
            typingSet.delete((user === null || user === void 0 ? void 0 : user.userId) || "");
            // Broadcast to others in the room
            socket.to(roomName).emit("stop_typing", {
                userId: user === null || user === void 0 ? void 0 : user.userId,
                typingUsers: Array.from(typingSet),
            });
            if (typingSet.size === 0) {
                typingUsers.delete(chatId);
            }
        }
    });
    // Mark messages as read
    socket.on("mark_read", (data) => __awaiter(this, void 0, void 0, function* () {
        const { chatId, messageIds } = data;
        const roomName = `chat:${chatId}`;
        // Update messages in database
        yield db_1.default.chatMessage.updateMany({
            where: { id: { in: messageIds }, conversationId: chatId },
            data: { read: true },
        });
        // Notify others that messages were read
        socket.to(roomName).emit("messages_read", {
            chatId,
            messageIds,
            readBy: user === null || user === void 0 ? void 0 : user.userId,
        });
    }));
    // Delete message (optional feature)
    socket.on("delete_message", (data) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { chatId, messageId } = data;
            if (!(user === null || user === void 0 ? void 0 : user.userId)) {
                socket.emit("error", { message: "Unauthorized" });
                return;
            }
            const message = yield db_1.default.chatMessage.findUnique({
                where: { id: messageId },
                select: { senderId: true, conversationId: true },
            });
            if (!message || message.conversationId !== chatId) {
                socket.emit("error", { message: "Message not found" });
                return;
            }
            if (message.senderId !== user.userId) {
                socket.emit("error", {
                    message: "Cannot delete someone else's message",
                });
                return;
            }
            yield db_1.default.chatMessage.delete({ where: { id: messageId } });
            // Broadcast deletion to all users in chat room
            const roomName = `chat:${chatId}`;
            io.to(roomName).emit("message_deleted", {
                chatId,
                messageId,
                deletedBy: user === null || user === void 0 ? void 0 : user.userId,
            });
            console.log(`Message ${messageId} deleted by ${user === null || user === void 0 ? void 0 : user.email}`);
        }
        catch (error) {
            console.error("Error deleting message:", error);
            socket.emit("error", { message: "Failed to delete message" });
        }
    }));
}
