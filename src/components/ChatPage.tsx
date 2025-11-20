import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, User, Circle } from "lucide-react";

type Message = {
  id: number;
  senderId: number;
  text: string;
  time: string;
  isMine: boolean;
};

type Contact = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

const contacts: Contact[] = [
  { id: 1, name: "Nguyễn Văn An", avatar: "A", lastMessage: "Thiết bị đã hoạt động lại", time: "5 phút", unread: 2, online: true },
  { id: 2, name: "Trần Thị Bình", avatar: "B", lastMessage: "Cảm ơn bạn đã hỗ trợ!", time: "10 phút", unread: 0, online: true },
  { id: 3, name: "Lê Minh Cường", avatar: "C", lastMessage: "Tôi cần help về API", time: "1 giờ", unread: 1, online: false },
  { id: 4, name: "Phạm Thu Hà", avatar: "H", lastMessage: "Ok, tôi sẽ kiểm tra", time: "2 giờ", unread: 0, online: true },
  { id: 5, name: "Hoàng Văn Đức", avatar: "D", lastMessage: "Đã import xong dữ liệu", time: "1 ngày", unread: 0, online: false },
];

const initialMessages: Message[] = [
  { id: 1, senderId: 1, text: "Chào bạn, tôi có vấn đề với cảm biến nhiệt độ", time: "10:30", isMine: false },
  { id: 2, senderId: 0, text: "Chào bạn! Bạn gặp vấn đề gì vậy?", time: "10:31", isMine: true },
  { id: 3, senderId: 1, text: "Cảm biến không gửi dữ liệu lên server", time: "10:32", isMine: false },
  { id: 4, senderId: 0, text: "Để tôi kiểm tra. Bạn đợi chút nhé", time: "10:33", isMine: true },
  { id: 5, senderId: 0, text: "Tôi đã reset lại kết nối. Bạn thử kiểm tra xem", time: "10:35", isMine: true },
  { id: 6, senderId: 1, text: "Thiết bị đã hoạt động lại. Cảm ơn bạn!", time: "10:36", isMine: false },
];

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        senderId: 0,
        text: newMessage,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">Chat</h1>
        <p className="text-gray-600">Nhắn tin với người dùng và đồng nghiệp</p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
        <div className="grid grid-cols-12 h-full">
          {/* Contacts Sidebar */}
          <div className="col-span-12 md:col-span-4 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <motion.button
                  key={contact.id}
                  whileHover={{ backgroundColor: "#fef2f2" }}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full p-4 border-b border-gray-200 text-left transition-colors ${
                    selectedContact.id === contact.id ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white">
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-gray-900 truncate">{contact.name}</h4>
                        <span className="text-xs text-gray-500">{contact.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                        {contact.unread > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-12 md:col-span-8 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white">
                    {selectedContact.avatar}
                  </div>
                  {selectedContact.online && (
                    <Circle className="absolute bottom-0 right-0 w-2.5 h-2.5 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedContact.online ? "Đang hoạt động" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[70%] ${message.isMine ? "flex-row-reverse" : ""}`}>
                    {!message.isMine && (
                      <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                        {selectedContact.avatar}
                      </div>
                    )}
                    <div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.isMine
                            ? "bg-gradient-to-r from-red-700 to-red-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{message.text}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${message.isMine ? "text-right" : "text-left"}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors resize-none"
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                  />
                  <button className="absolute right-3 bottom-3 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  Gửi
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
