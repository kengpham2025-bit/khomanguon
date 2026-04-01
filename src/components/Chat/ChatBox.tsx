"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, User, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  _id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: number;
}

interface ChatBoxProps {
  locale?: "vi" | "en";
  roomId?: string;
  currentUserId?: string;
  partnerName?: string;
  messages?: Message[];
  onSendMessage?: (content: string) => void;
}

export function ChatBox({
  locale = "vi",
  roomId,
  currentUserId = "user-1",
  partnerName = "Support",
  messages: initialMessages = [],
  onSendMessage,
}: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      _id: `msg-${Date.now()}`,
      senderId: currentUserId,
      content: message,
      isRead: false,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    onSendMessage?.(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const labels = locale === "vi"
    ? { placeholder: "Nhập tin nhắn...", title: "Hỗ trợ" }
    : { placeholder: "Type a message...", title: "Support" };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-soft-xl transition-all hover:bg-primary-700",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
          1
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft-xl",
              isMinimized ? "h-14 w-80" : "h-[500px] w-80"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{partnerName}</h4>
                  <p className="text-xs text-green-500">
                    {locale === "vi" ? "Đang trực tuyến" : "Online"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MessageCircle className="mb-3 h-12 w-12 text-slate-300" />
                      <p className="text-sm text-slate-500">
                        {locale === "vi"
                          ? "Bắt đầu cuộc trò chuyện"
                          : "Start a conversation"}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          msg.senderId === currentUserId ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2",
                            msg.senderId === currentUserId
                              ? "bg-primary-600 text-white"
                              : "bg-slate-100 text-slate-900"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={cn(
                              "mt-1 text-xs",
                              msg.senderId === currentUserId
                                ? "text-primary-200"
                                : "text-slate-400"
                            )}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-100 p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={labels.placeholder}
                      className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                        message.trim()
                          ? "bg-primary-600 text-white hover:bg-primary-700"
                          : "bg-slate-200 text-slate-400"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
