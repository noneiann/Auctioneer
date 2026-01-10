# WebSocket Implementation Guide

## Overview

This guide shows how to use the real-time WebSocket features for live auction bidding and chat in the Auctioneer application.

## Components Created

### Backend

1. **WebSocket Server** (`apps/backend/src/websocket/index.ts`)

   - JWT authentication for socket connections
   - Connection/disconnection handling
   - Error handling

2. **Auction WebSocket Service** (`apps/backend/src/websocket/auctionWebSocket.ts`)

   - Events: `join_auction`, `leave_auction`, `place_bid`, `end_auction`
   - Broadcasts: `bid_placed`, `auction_ended`, `user_joined`, `user_left`
   - Real-time bid validation and broadcasting

3. **Chat WebSocket Service** (`apps/backend/src/websocket/chatWebSocket.ts`)
   - Events: `join_chat`, `send_message`, `typing`, `delete_message`
   - Broadcasts: `new_message`, `user_typing`, `message_deleted`
   - In-memory message storage (migrate to database for production)

### Frontend

1. **Socket Context** (`apps/frontend/src/contexts/SocketContext.tsx`)

   - Manages global WebSocket connection
   - Auto-reconnection logic
   - JWT authentication on connection

2. **Auction Socket Hook** (`apps/frontend/src/hooks/useAuctionSocket.tsx`)

   - `useAuctionSocket(auctionId)` - Join auction room and listen for bids
   - Returns: `auctionState`, `recentBids`, `placeBid()`, `error`, `isBidding`

3. **Chat Socket Hook** (`apps/frontend/src/hooks/useChatSocket.tsx`)

   - `useChatSocket(chatId)` - Join chat room and handle messages
   - Returns: `messages`, `sendMessage()`, `startTyping()`, `stopTyping()`, `deleteMessage()`

4. **Live Bidding Component** (`apps/frontend/src/components/LiveBidding.tsx`)

   - Real-time bid display
   - Live participant count
   - Quick bid increment buttons
   - Recent bids list with updates

5. **Auction Chat Component** (`apps/frontend/src/components/AuctionChat.tsx`)
   - Real-time messaging
   - Typing indicators
   - Message deletion
   - Auto-scroll to latest message

## Usage Example

### 1. Add to Auction Detail Page

```tsx
import LiveBidding from "@/components/LiveBidding";
import AuctionChat from "@/components/AuctionChat";

export default function AuctionPage() {
	const auctionId = "your-auction-id";

	return (
		<div className='grid grid-cols-3 gap-6'>
			{/* Left: Auction details */}
			<div className='col-span-2'>
				{/* Your existing auction info */}

				{/* Add chat */}
				<AuctionChat auctionId={auctionId} />
			</div>

			{/* Right: Live bidding */}
			<div>
				<LiveBidding auctionId={auctionId} />
			</div>
		</div>
	);
}
```

### 2. Custom Hook Usage

```tsx
import { useAuctionSocket } from "@/hooks/useAuctionSocket";

function MyComponent() {
	const { auctionState, recentBids, error, placeBid, isConnected } =
		useAuctionSocket("auction-id");

	const handleBid = () => {
		placeBid(100.0);
	};

	return (
		<div>
			<p>Current Bid: ${auctionState?.auction?.currentBid}</p>
			<p>Watching: {auctionState?.participantCount}</p>
			<button onClick={handleBid}>Place $100 Bid</button>
		</div>
	);
}
```

### 3. Chat Usage

```tsx
import { useChatSocket } from "@/hooks/useChatSocket";

function ChatComponent() {
	const { messages, sendMessage, startTyping, stopTyping, isConnected } =
		useChatSocket("chat-id");

	const [input, setInput] = useState("");

	const handleSend = () => {
		sendMessage(input);
		setInput("");
	};

	return (
		<div>
			<div className='messages'>
				{messages.map((msg) => (
					<div key={msg.id}>{msg.content}</div>
				))}
			</div>
			<input
				value={input}
				onChange={(e) => {
					setInput(e.target.value);
					startTyping();
				}}
				onBlur={stopTyping}
			/>
			<button onClick={handleSend}>Send</button>
		</div>
	);
}
```

## WebSocket Events

### Auction Events

#### Client → Server

- `join_auction(auctionId)` - Join auction room
- `leave_auction(auctionId)` - Leave auction room
- `place_bid({auctionId, amount})` - Place a bid
- `end_auction(auctionId)` - End auction (owner only)

#### Server → Client

- `auction_state({auction, isActive, participantCount})` - Initial state
- `bid_placed({bid, auction})` - New bid broadcast
- `bid_success({bid, auction})` - Bid confirmation to bidder
- `bid_error({message})` - Bid error to bidder
- `auction_ended({auction, message})` - Auction ended notification
- `user_joined({userId, participantCount})` - Someone joined
- `user_left({userId, participantCount})` - Someone left

### Chat Events

#### Client → Server

- `join_chat({chatId, chatType})` - Join chat room
- `leave_chat(chatId)` - Leave chat room
- `send_message({chatId, message})` - Send message
- `typing(chatId)` - Start typing
- `stop_typing(chatId)` - Stop typing
- `delete_message({chatId, messageId})` - Delete own message
- `mark_read({chatId, messageIds})` - Mark messages as read

#### Server → Client

- `chat_history({chatId, messages, participantCount})` - Chat history
- `new_message(message)` - New message broadcast
- `user_typing({userId, username, typingUsers})` - Someone is typing
- `stop_typing({userId, typingUsers})` - Someone stopped typing
- `message_deleted({chatId, messageId})` - Message was deleted
- `messages_read({chatId, messageIds, readBy})` - Messages marked as read
- `message_error({message})` - Error sending message

## Running the Application

### Start Backend with WebSocket

```bash
cd apps/backend
npm run dev
```

The server now includes:

- HTTP API on port 4000
- WebSocket server on the same port
- Socket.IO ready for connections

### Start Frontend

```bash
cd apps/frontend
npm run dev
```

The frontend:

- Connects to WebSocket automatically when user is authenticated
- SocketProvider wraps the entire app in layout.tsx
- Auto-reconnects on connection loss

## Testing

### Test Live Bidding

1. Open auction page in two different browsers
2. Place bid in one browser
3. See real-time update in the other browser
4. Check participant count updates

### Test Chat

1. Open auction with chat in two browsers
2. Send message from one browser
3. See message appear instantly in other browser
4. Type in one browser to see typing indicator in other
5. Delete a message and verify it disappears for everyone

## Production Considerations

1. **Scale with Redis Adapter** (for multiple servers)

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
const adapter = createAdapter(redisClient, redisClient.duplicate());
io.adapter(adapter);
```

2. **Move Chat to Database**

   - Currently using in-memory storage
   - Migrate to PostgreSQL with Prisma schema provided in SYSTEM_DESIGN.md

3. **Add Rate Limiting**

```typescript
socket.use((event, next) => {
	// Implement rate limiting per user
	next();
});
```

4. **Monitor Performance**

   - Track active connections
   - Monitor message/bid throughput
   - Set up alerts for connection spikes

5. **Security Enhancements**
   - Validate all incoming data
   - Sanitize chat messages (XSS prevention)
   - Implement room permission checks
   - Add IP-based rate limiting

## Troubleshooting

### WebSocket Not Connecting

- Check if user is authenticated (token in localStorage)
- Verify backend is running on port 4000
- Check browser console for errors
- Ensure CORS settings allow localhost:3000

### Bids Not Broadcasting

- Verify user joined auction room
- Check if auction is active (between start/end time)
- Ensure bid amount is higher than current bid
- Check backend logs for errors

### Chat Messages Not Sending

- Verify chat room was joined
- Check message length (max 1000 chars)
- Ensure WebSocket connection is active
- Check for message_error events

## Next Steps

1. **Add Database Persistence for Chat**

   - Implement Message, Chat, ChatParticipant models
   - Save messages to database
   - Load chat history from database

2. **Add Push Notifications**

   - Notify users when outbid
   - Alert when auction ending soon
   - New message notifications

3. **Add Audio/Visual Feedback**

   - Sound effect on new bid
   - Toast notifications
   - Animation on bid updates

4. **Advanced Features**
   - Private messaging between users
   - Auction watchlist with live updates
   - Bid history analytics
   - Auto-bid functionality
