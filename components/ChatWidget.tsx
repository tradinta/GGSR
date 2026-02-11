"use client";

import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, X, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type Message = {
    sender: "user" | "admin";
    text?: string;
    imageUrl?: string;
    timestamp: number;
};

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;

        // Connect to Socket.IO server (Needs to be running)
        const socket = io({
            path: "/api/socket", // Custom path for Next.js API route integration
            query: { userId: user.uid }
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Chat Connected");
            // Add welcome message from system
            setMessages((prev) => [
                ...prev,
                { sender: "admin", text: "Hello! I'm here to help with your transaction.", timestamp: Date.now() }
            ]);
        });

        socket.on("message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const sendMessage = () => {
        if (!input.trim() || !socketRef.current) return;

        const msg: Message = { sender: "user", text: input, timestamp: Date.now() };
        socketRef.current.emit("message", msg);
        setMessages((prev) => [...prev, msg]);
        setInput("");
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socketRef.current) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            const msg: Message = {
                sender: "user",
                imageUrl: data.secure_url,
                timestamp: Date.now()
            };

            socketRef.current.emit("message", msg);
            setMessages((prev) => [...prev, msg]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!user) return null; // Only show if logged in

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-black p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            )}

            {isOpen && (
                <div className="bg-card border border-border w-80 h-96 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary/10 p-4 flex justify-between items-center border-b border-border">
                        <h3 className="font-bold text-sm">Support Chat</h3>
                        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-xs ${msg.sender === "user"
                                        ? "bg-primary text-black rounded-tr-none"
                                        : "bg-muted text-white rounded-tl-none"
                                        }`}
                                >
                                    {msg.imageUrl && (
                                        <div className="relative w-full aspect-square mb-2 rounded overflow-hidden">
                                            <Image
                                                src={msg.imageUrl}
                                                alt="Attachment"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    {msg.text && <p>{msg.text}</p>}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-border flex gap-2 items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-muted-foreground hover:text-white disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-accent/50 text-xs p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={sendMessage} className="text-primary hover:text-primary/80">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
