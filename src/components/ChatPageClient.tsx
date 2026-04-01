"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  MessageCircle,
  User,
  Minimize2,
  Maximize2,
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  _id: string;
  senderId: string;
  senderName?: string;
  content: string;
  isRead: boolean;
  createdAt: number;
  isAdmin?: boolean;
}

interface ChatRoom {
  _id: string;
  type: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount?: number;
}

interface ChatPageClientProps {
  locale?: "vi" | "en";
  currentUserId?: string;
  currentUserName?: string;
}

const demoRooms: ChatRoom[] = [
  {
    _id: "room-1",
    type: "buyer_seller",
    partnerName: "AI Solutions Store",
    lastMessage: "Cảm ơn bạn đã mua hàng!",
    lastMessageAt: Date.now() - 3600000,
    unreadCount: 2,
  },
  {
    _id: "room-2",
    type: "user_admin",
    partnerName: "Hỗ trợ KHOMANGUON",
    lastMessage: "Chào bạn, tôi có thể giúp gì?",
    lastMessageAt: Date.now() - 7200000,
    unreadCount: 1,
  },
];

const demoMessages: Message[] = [
  {
    _id: "m1",
    senderId: "room-1",
    senderName: "AI Solutions Store",
    content: "Chào bạn! Cảm ơn đã mua ChatGPT Plus. Tài khoản đã được gửi qua email.",
    isRead: true,
    createdAt: Date.now() - 3600000,
    isAdmin: false,
  },
  {
    _id: "m2",
    senderId: "current-user",
    senderName: "Bạn",
    content: "Cảm ơn shop! Đã nhận được tài khoản rồi.",
    isRead: true,
    createdAt: Date.now() - 3500000,
    isAdmin: false,
  },
  {
    _id: "m3",
    senderId: "room-1",
    senderName: "AI Solutions Store",
    content: "Cảm ơn bạn đã mua hàng! Nếu cần hỗ trợ gì thêm, inbox shop nhé.",
    isRead: false,
    createdAt: Date.now() - 3400000,
    isAdmin: false,
  },
];

export function ChatPageClient({ locale = "vi", currentUserId = "current-user", currentUserName = "Bạn" }: ChatPageClientProps) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedRoom]);

  const formatTime = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return locale === "vi" ? "Vừa xong" : "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${locale === "vi" ? " phút trước" : "m ago"}`;
    return new Date(ts).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = () => {
    if (!input.trim() || !selectedRoom) return;

    const newMsg: Message = {
      _id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      content: input,
      isRead: true,
      createdAt: Date.now(),
      isAdmin: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Auto-reply simulation
    setTimeout(() => {
      const reply: Message = {
        _id: `msg-${Date.now()}-reply`,
        senderId: selectedRoom._id,
        senderName: selectedRoom.partnerName,
        content: locale === "vi"
          ? "Cảm ơn bạn! Shop sẽ phản hồi sớm nhất có thể."
          : "Thank you! We will reply as soon as possible.",
        isRead: false,
        createdAt: Date.now(),
        isAdmin: false,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const roomMessages = selectedRoom
    ? messages.filter((m) =>
        (selectedRoom.type === "buyer_seller" && (m.senderId === selectedRoom._id || m.senderId === currentUserId)) ||
        (selectedRoom.type === "user_admin" && (m.senderId === selectedRoom._id || m.senderId === currentUserId))
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
            {locale === "vi" ? "Tin nhắn" : "Messages"}
          </h1>
          <p className="mt-1 text-slate-500">
            {locale === "vi" ? "Hỗ trợ mua hàng và khiếu nại" : "Purchase support and disputes"}
          </p>
        </div>

        <div className="flex h-[600px] gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-sm">
          {/* Room List */}
          <div className={cn(
            "flex flex-col border-r border-slate-100 transition-all",
            selectedRoom ? "hidden w-0 md:flex md:w-72" : "w-full md:w-72"
          )}>
            <div className="border-b border-slate-100 p-4">
              <h3 className="font-semibold text-slate-900">
                {locale === "vi" ? "Cuộc trò chuyện" : "Conversations"}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {demoRooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-slate-50 p-4 text-left transition-colors",
                    selectedRoom?._id === room._id ? "bg-primary-50" : "hover:bg-slate-50"
                  )}
                >
                  <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    {room.partnerName?.[0]?.toUpperCase()}
                    {room.unreadCount && room.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-semibold text-slate-900">{room.partnerName}</span>
                      {room.lastMessageAt && (
                        <span className="flex-shrink-0 text-xs text-slate-400">{formatTime(room.lastMessageAt)}</span>
                      )}
                    </div>
                    {room.lastMessage && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">{room.lastMessage}</p>
                    )}
                  </div>
                </button>
              ))}
              {demoRooms.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <MessageCircle className="mb-2 h-10 w-10" />
                  <p className="text-sm">{locale === "vi" ? "Chưa có cuộc trò chuyện" : "No conversations yet"}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex flex-1 flex-col transition-all",
            !selectedRoom ? "hidden md:flex" : "flex"
          )}>
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 md:hidden"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                      {selectedRoom.partnerName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{selectedRoom.partnerName}</div>
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {locale === "vi" ? "Đang trực tuyến" : "Online"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                </div>

                {/* Messages */}
                {!isMinimized && (
                  <>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                      {roomMessages.map((msg) => (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex",
                            msg.senderId === currentUserId ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2.5",
                            msg.senderId === currentUserId
                              ? "bg-primary-600 text-white"
                              : "bg-slate-100 text-slate-900"
                          )}>
                            {msg.senderId !== currentUserId && (
                              <p className="mb-1 text-xs font-semibold opacity-70">{msg.senderName}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={cn(
                              "mt-1 text-xs",
                              msg.senderId === currentUserId ? "text-primary-200" : "text-slate-400"
                            )}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-slate-100 p-4">
                      <div className="flex items-center gap-2">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={locale === "vi" ? "Nhập tin nhắn..." : "Type a message..."}
                          rows={1}
                          className="flex-1 resize-none rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSend}
                          disabled={!input.trim()}
                          className={cn(
                            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all",
                            input.trim()
                              ? "bg-primary-600 text-white hover:bg-primary-700"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          <Send className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <MessageCircle className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">
                  {locale === "vi" ? "Chọn cuộc trò chuyện" : "Select a conversation"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {locale === "vi"
                    ? "Chọn một cuộc trò chuyện để bắt đầu nhắn tin."
                    : "Select a conversation to start messaging."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
