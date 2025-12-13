import React, { useState, useEffect, useRef } from "react";

type ChatMessage = {
    role: "user" | "bot";
    content: string;
};

export default function AIPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);


    // Tự động scroll xuống cuối khi có message mới
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage() {
        if (!input.trim()) return;

        const question = input;

        // Push tin nhắn user lên UI
        const userMsg: ChatMessage = { role: "user", content: question };
        setMessages((prev) => [...prev, userMsg]);

        setInput("");

        try {
            const res = await fetch(`http://localhost:8080/api/v1/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ message: question }),
            });

            const data = await res.json();

            const botMsg: ChatMessage = {
                role: "bot",
                content: data.answer || "Không có phản hồi từ AI.",
            };

            setMessages((prev) => [...prev, botMsg]);

        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "❌ Không thể kết nối server!" },
            ]);
        }
    }

    return (
        <div className="h-[80vh] flex flex-col bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
                🤖 AI Assistant
            </h1>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-xl space-y-4 shadow-inner">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`px-4 py-3 rounded-2xl shadow max-w-[80%] ${msg.role === "user"
                                    ? "bg-red-600 text-white"
                                    : "bg-white border border-gray-200"
                                }`}
                            style={{ whiteSpace: "pre-wrap" }}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                <div ref={chatEndRef}></div>
            </div>

            <div className="mt-4 flex gap-2">
                <input
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 shadow focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập câu hỏi..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-red-600 text-white px-5 py-3 rounded-xl shadow hover:bg-red-700"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}