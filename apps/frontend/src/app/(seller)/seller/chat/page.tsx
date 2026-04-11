"use client";

import React, { useState } from "react";
import { Search, MessageSquare, MoreVertical, Send } from "lucide-react";

interface ChatContact {
    id: string;
    name: string;
    item: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar?: string;
    online: boolean;
}

const mockContacts: ChatContact[] = [
    {
        id: "1",
        name: "Alice Cooper",
        item: "Vintage Camera",
        lastMessage: "Is the lens scratch-free?",
        time: "10:30 AM",
        unread: 2,
        online: true,
    },
    {
        id: "2",
        name: "Bob Smith",
        item: "Modern Sofa",
        lastMessage: "I can pick it up tomorrow.",
        time: "Yesterday",
        unread: 0,
        online: false,
    },
    {
        id: "3",
        name: "Charlie Brown",
        item: "Gaming Laptop",
        lastMessage: "Thanks for the quick reply!",
        time: "Mon",
        unread: 0,
        online: false,
    },
];

export default function SellerChatPage() {
    const [activeChat, setActiveChat] = useState<string | null>(mockContacts[0].id);
    const [messageInput, setMessageInput] = useState("");

    const selectedContact = mockContacts.find((c) => c.id === activeChat);

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Contacts Sidebar */}
            <div className="w-80 flex flex-col bg-[#0f172a]/50 border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#1e293b]">
                    <h2 className="text-lg font-bold text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-[#1e293b]/50 border border-[#1e293b] rounded-lg text-white placeholder-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {mockContacts.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setActiveChat(contact.id)}
                            className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${activeChat === contact.id
                                    ? "bg-brand-600/20 border border-brand-500/30"
                                    : "hover:bg-[#1e293b]/30 border border-transparent"
                                }`}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-white font-medium border border-[#1e293b]">
                                    {contact.name.charAt(0)}
                                </div>
                                {contact.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-sm font-medium truncate ${activeChat === contact.id ? "text-white" : "text-brand-100"}`}>
                                        {contact.name}
                                    </h3>
                                    <span className="text-xs text-brand-400">{contact.time}</span>
                                </div>
                                <p className="text-xs text-brand-300 truncate mb-1">
                                    Re: <span className="text-brand-400">{contact.item}</span>
                                </p>
                                <p className="text-xs text-brand-400 truncate">{contact.lastMessage}</p>
                            </div>
                            {contact.unread > 0 && (
                                <div className="min-w-[1.25rem] h-5 flex items-center justify-center bg-brand-500 text-white text-[10px] font-bold rounded-full px-1">
                                    {contact.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0f172a]/50 border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0f172a]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-white font-medium border border-[#1e293b]">
                                    {selectedContact.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedContact.name}</h3>
                                    <p className="text-xs text-brand-400 flex items-center gap-1">
                                        Item: <span className="text-brand-300">{selectedContact.item}</span>
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 text-brand-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages List (Mock) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#020617]/30">
                            <div className="flex justify-center mb-6">
                                <span className="px-3 py-1 bg-[#1e293b] text-brand-400 text-xs rounded-full">
                                    Today
                                </span>
                            </div>

                            <div className="flex justify-start">
                                <div className="max-w-[70%] bg-[#1e293b] border border-[#1e293b] text-brand-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                                    <p>Hi, I&apos;m interested in the {selectedContact.item}.</p>
                                    <span className="text-[10px] text-brand-400 mt-1 block">10:00 AM</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="max-w-[70%] bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-lg shadow-brand-600/10">
                                    <p>Hello! Sure, what would you like to know?</p>
                                    <span className="text-[10px] text-brand-200 mt-1 block text-right">10:05 AM</span>
                                </div>
                            </div>

                            <div className="flex justify-start">
                                <div className="max-w-[70%] bg-[#1e293b] border border-[#1e293b] text-brand-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                                    <p>{selectedContact.lastMessage}</p>
                                    <span className="text-[10px] text-brand-400 mt-1 block">10:30 AM</span>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-[#1e293b] bg-[#0f172a]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 bg-[#1e293b]/50 border border-[#1e293b] rounded-xl text-white placeholder-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                />
                                <button className="px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors shadow-lg shadow-brand-600/20 flex items-center gap-2 font-medium">
                                    <Send className="w-4 h-4" />
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='flex flex-col items-center justify-center h-full text-center'>
                        <MessageSquare className='w-16 h-16 text-brand-500/20 mb-4' />
                        <p className='text-brand-300'>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
