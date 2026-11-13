"use client";
import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ChatModal({ isOpen, onClose, petId, shelterId, shelterName, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchMessages = async () => {
    if (!user._id || !shelterId || !petId) return;
    try {
      const res = await fetch(`/api/messages?sender=${user._id}&receiver=${shelterId}&pet=${petId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, petId, shelterId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !token) return;

    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: shelterId,
          pet: petId,
          text: newMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      
      setNewMessage("");
      fetchMessages(); 
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="font-heading font-bold text-lg">
              {shelterName.startsWith("Chat with") 
                ? shelterName 
                : `Chat with ${shelterName}`}
            </h2>
            
            {/* Only show this line for regular Users (Adopters) */}
            {currentUser?.role === "user" && (
              <p className="text-xs text-white/80">Asking about this pet</p>
            )}
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary">
          {messages.length === 0 ? (
            <p className="text-center text-light text-sm mt-10">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === user._id;
              return (
                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    isMe ? "bg-primary text-white rounded-br-none" : "bg-white text-dark rounded-bl-none shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field bg-secondary border-none flex-1 py-2"
            disabled={!token}
          />
          <button 
            type="submit" 
            disabled={loading || !token}
            className="bg-primary text-white p-3 rounded-xl hover:bg-primary-hover transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}