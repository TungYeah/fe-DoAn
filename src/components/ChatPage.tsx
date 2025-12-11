import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Reply,
  SmilePlus,
  MessageSquare,
  Send,
  X,
  Users,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Smile,
  ChartBar,
  Percent,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Độ thụt lề bằng phần trăm theo yêu cầu (30%)
const INDENT_PERCENTAGE = "6%";
const INDENT_PERCENTAGES = "5%";

// ====== MOCK MODE ======
// Set to true để dùng mock data (không cần backend)
// Set to false để dùng API thật
const USE_MOCK_DATA = false;

// ====== MOCK DATA ======
const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    content: "Hệ thống IoT Platform đã hoạt động rất tốt! Cảm ơn team đã phát triển. 👍",
    hidden: false,
    parentId: null,
    replyCount: 2,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userEmail: "admin@ptit.edu.vn",
    userFullName: "Admin PTIT",
  },
  {
    id: "2",
    content: "Tôi có thể import dữ liệu từ file Excel không? 📊",
    hidden: false,
    parentId: null,
    replyCount: 1,
    createdBy: "user2",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    userEmail: "binh.tran@ptit.edu.vn",
    userFullName: "Trần Thị Bình",
  },
  {
    id: "3",
    content: "Dashboard có hỗ trợ dark mode không ạ? 🌙",
    hidden: false,
    parentId: null,
    replyCount: 0,
    createdBy: "user3",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    userEmail: "nam.le@ptit.edu.vn",
    userFullName: "Lê Hoàng Nam",
  },
];

const MOCK_REPLIES: Record<string, Comment[]> = {
  "1": [
    {
      id: "1-1",
      content: "Đúng vậy, giao diện rất trực quan và dễ sử dụng! 😊",
      hidden: false,
      parentId: "1",
      replyCount: 0,
      createdBy: "user4",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      userEmail: "an.nguyen@ptit.edu.vn",
      userFullName: "Nguyễn Văn An",
    },
    {
      id: "1-2",
      content: "Tôi rất thích phần biểu đồ real-time 📈",
      hidden: false,
      parentId: "1",
      replyCount: 0,
      createdBy: "user5",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userEmail: "huong.pham@ptit.edu.vn",
      userFullName: "Phạm Thị Hương",
    },
  ],
  "2": [
    {
      id: "2-1",
      content: "Có chứ! Vào mục Import thiết bị và chọn file Excel nhé. ✨",
      hidden: false,
      parentId: "2",
      replyCount: 0,
      createdBy: "admin",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      userEmail: "admin@ptit.edu.vn",
      userFullName: "Admin PTIT",
    },
  ],
};

// ====== COMMENT TYPE KHỚP VỚI BE ======
type Comment = {
  id: string;
  content: string;
  hidden: boolean;
  parentId: string | null;
  replyCount: number;

  createdBy?: string;
  createdAt?: string;

  userEmail?: string;
  userFullName?: string;
  userAvatar?: string;
};

type ReplyMap = Record<string, Comment[]>;
type BooleanMap = Record<string, boolean>;

const STICKERS = ["😂", "🤣", "😎", "😍", "👍", "🔥", "❤️", "✨"];

type ReplyProps = {
  replies: ReplyMap;
  expanded: BooleanMap;
  loadingReply: Record<string, boolean>;
  setReplies: React.Dispatch<React.SetStateAction<ReplyMap>>;
  setExpanded: React.Dispatch<React.SetStateAction<BooleanMap>>;
  setLoadingReply: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  replyTo: string | null;
  setReplyTo: React.Dispatch<React.SetStateAction<string | null>>;
  setReplyContent: React.Dispatch<React.SetStateAction<string>>;
  handlePostReply: (parentId: string) => Promise<void>;
  replyContent: string;
  posting: boolean;
  formatDate: (c: Comment) => string;
  authHeaders: () => Record<string, string>;
  addStickerToReply: (s: string) => void;
  showEmojiPicker: string | null;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<string | null>>;
};

/* ======================================================
   COMPONENT: Sticker Bar (Emoji Picker)
====================================================== */
const StickerBar = ({ onPick, show, onToggle }: { 
  onPick: (s: string) => void; 
  show: boolean;
  onToggle: () => void;
}) => (
  <div className="relative">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      type="button"
    >
      <Smile className="w-5 h-5 text-gray-500" />
    </motion.button>

    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="absolute left-0 bottom-12 bg-white border-2 border-red-100 rounded-xl shadow-xl p-3 flex gap-2 z-50"
        >
          {STICKERS.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                onPick(s);
                onToggle();
              }}
              className="text-2xl hover:bg-red-50 w-10 h-10 rounded-lg transition-colors flex items-center justify-center"
              type="button"
            >
              {s}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ======================================================
   COMPONENT: Reply Box
====================================================== */
function ReplyBox({
  value,
  onChange,
  onCancel,
  onSend,
  disabled,
  showEmojiPicker,
  onToggleEmoji,
  onPickEmoji,
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSend: () => void;
  disabled: boolean;
  showEmojiPicker: boolean;
  onToggleEmoji: () => void;
  onPickEmoji: (s: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 pl-12 border-l-2 border-blue-200"
    >
      <div className="ml-4">
        <textarea
          rows={2}
          className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 shadow-sm outline-none transition-all resize-none"
          placeholder="Viết phản hồi của bạn..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="flex items-center justify-between mt-2">
          <StickerBar 
            onPick={onPickEmoji} 
            show={showEmojiPicker}
            onToggle={onToggleEmoji}
          />

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              type="button"
            >
              Hủy
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSend}
              disabled={disabled}
              className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg flex items-center gap-2 transition-all ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
              }`}
              type="button"
            >
              <Send className="w-4 h-4" />
              Gửi
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ======================================================
   COMPONENT: Comment Item RECURSIVE
====================================================== */
function CommentItemRecursive({
  comment,
  isTopLevel,
  ...props
}: {
  comment: Comment;
  isTopLevel: boolean;
} & ReplyProps) {
  const displayName =
    comment.userFullName ||
    comment.userEmail ||
    comment.createdBy ||
    "Ẩn danh";

  const avatarLetter = displayName.charAt(0).toUpperCase();
  const isExpanded = props.expanded[comment.id];
  const repliesOfThis = props.replies[comment.id] ?? [];
  const isLoading = props.loadingReply[comment.id];
  const isReplying = props.replyTo === comment.id;
  const showReplyEmoji = props.showEmojiPicker === `reply-${comment.id}`;

  const loadReplies = async (forceReload = false) => {
    if (props.replies[comment.id] && !forceReload) {
      props.setExpanded((prev) => ({ ...prev, [comment.id]: true }));
      return;
    }

    try {
      props.setLoadingReply((prev) => ({ ...prev, [comment.id]: true }));

      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockReplies = MOCK_REPLIES[comment.id] || [];
        props.setReplies((prev) => ({
          ...prev,
          [comment.id]: mockReplies,
        }));
      } else {
        const res = await fetch(
          `${API_BASE}/api/v1/comments/${comment.id}/replies?page=0&size=20`,
          { headers: props.authHeaders() }
        );

        const data = await res.json();
        const list: Comment[] = data.content ?? [];

        props.setReplies((prev) => ({
          ...prev,
          [comment.id]: list,
        }));
      }

      props.setExpanded((prev) => ({ ...prev, [comment.id]: true }));
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      props.setLoadingReply((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  const toggleExpand = async () => {
    if (isExpanded) {
      props.setExpanded((prev) => ({ ...prev, [comment.id]: false }));
    } else {
      if (repliesOfThis.length === 0 && comment.replyCount > 0) {
        await loadReplies();
      } else {
        props.setExpanded((prev) => ({ ...prev, [comment.id]: true }));
      }
    }
  };

  const startReply = () => {
    props.setReplyTo(comment.id);
    props.setReplyContent("");
    props.setShowEmojiPicker(null);
  };

  const cancelReply = () => {
    props.setReplyTo(null);
    props.setShowEmojiPicker(null);
  };

  const sendReply = () => {
    props.handlePostReply(comment.id);
  };

  const styleIndent = isTopLevel ? {} : { paddingLeft: INDENT_PERCENTAGE };

  // Avatar gradient colors based on level
  const avatarGradient = isTopLevel
    ? "from-blue-600 to-blue-700"
    : "from-green-600 to-green-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
      style={styleIndent}
    >
      {/* Thread line for nested comments */}
      {!isTopLevel && (
        <div className="absolute left-[-20px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent" />
      )}

      {/* Main Comment Content */}
      <div className={`flex gap-3 ${!isTopLevel ? "ml-2" : ""}`}>
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
          {comment.userAvatar ? (
            <img
              src={comment.userAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-lg">{avatarLetter}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Comment Bubble */}
          <div className="bg-gradient-to-br from-gray-50 to-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-gray-900">{displayName}</span>
              {props.formatDate(comment) && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {props.formatDate(comment)}
                </span>
              )}
            </div>
            <p className="text-gray-700 break-words whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startReply}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              type="button"
            >
              <Reply className="w-3.5 h-3.5" />
              Trả lời
            </motion.button>

            {comment.replyCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleExpand}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                type="button"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {isLoading
                  ? "Đang tải..."
                  : isExpanded
                  ? "Thu gọn"
                  : `${comment.replyCount} phản hồi`}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      <AnimatePresence>
        {isReplying && (
          <ReplyBox
            value={props.replyContent}
            onChange={props.setReplyContent}
            onCancel={cancelReply}
            onSend={sendReply}
            disabled={props.posting || !props.replyContent.trim()}
            showEmojiPicker={showReplyEmoji}
            onToggleEmoji={() =>
              props.setShowEmojiPicker(showReplyEmoji ? null : `reply-${comment.id}`)
            }
            onPickEmoji={props.addStickerToReply}
          />
        )}
      </AnimatePresence>

      {/* Nested Replies */}
      <AnimatePresence>
        {isExpanded && repliesOfThis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {repliesOfThis.map((r) => (
              <CommentItemRecursive
                key={r.id}
                comment={r}
                isTopLevel={false}
                {...props}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CommentsPage() {
  const [topComments, setTopComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<ReplyMap>({});
  const [expanded, setExpanded] = useState<BooleanMap>({});

  const [mainContent, setMainContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingReply, setLoadingReply] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState(false);

  const [showMainEmoji, setShowMainEmoji] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  // =============== UTIL ===============
  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const formatDate = (c: Comment) => {
    if (!c.createdAt) return "";
    const d = new Date(c.createdAt);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const addStickerToMain = (s: string) =>
    setMainContent((prev) => (prev ? prev + " " + s : s));

  const addStickerToReply = (s: string) =>
    setReplyContent((prev) => (prev ? prev + " " + s : s));

  // =============== LOAD TOP COMMENTS ===============
  const loadTopComments = async () => {
    try {
      setLoadingTop(true);

      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setTopComments(MOCK_COMMENTS);
      } else {
        const res = await fetch(
          `${API_BASE}/api/v1/comments/toplevel?page=0&size=20`,
          { headers: authHeaders() }
        );

        const data = await res.json();
        const list: Comment[] = data.content ?? [];

        setTopComments(list);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      // Fallback to mock data if API fails
      setTopComments(MOCK_COMMENTS);
    } finally {
      setLoadingTop(false);
    }
  };

  useEffect(() => {
    loadTopComments();
  }, []);

  // =============== POST MAIN COMMENT ===============
  const handlePostMain = async () => {
    if (!mainContent.trim() || posting) return;

    try {
      setPosting(true);

      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newComment: Comment = {
          id: `mock-${Date.now()}`,
          content: mainContent.trim(),
          hidden: false,
          parentId: null,
          replyCount: 0,
          createdBy: "you",
          createdAt: new Date().toISOString(),
          userEmail: "you@ptit.edu.vn",
          userFullName: "Bạn",
        };
        
        setTopComments((prev) => [newComment, ...prev]);
      } else {
        const res = await fetch(`${API_BASE}/api/v1/comments`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            content: mainContent.trim(),
            parentId: null,
          }),
        });

        const saved: Comment = await res.json();
        setTopComments((prev) => [saved, ...prev]);
      }

      setMainContent("");
      setShowMainEmoji(false);
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setPosting(false);
    }
  };

  // =============== POST REPLY ===============
  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim() || posting) return;

    try {
      setPosting(true);

      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newReply: Comment = {
          id: `mock-reply-${Date.now()}`,
          content: replyContent.trim(),
          hidden: false,
          parentId,
          replyCount: 0,
          createdBy: "you",
          createdAt: new Date().toISOString(),
          userEmail: "you@ptit.edu.vn",
          userFullName: "Bạn",
        };
        
        setReplies((prev) => ({
          ...prev,
          [parentId]: [...(prev[parentId] ?? []), newReply],
        }));

        setTopComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c
          )
        );

        setReplies((prev) => {
          const newReplies = { ...prev };
          for (const key in newReplies) {
            newReplies[key] = newReplies[key].map((c) =>
              c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c
            );
          }
          return newReplies;
        });
      } else {
        const res = await fetch(`${API_BASE}/api/v1/comments`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            content: replyContent.trim(),
            parentId,
          }),
        });

        const saved: Comment = await res.json();

        setReplies((prev) => ({
          ...prev,
          [parentId]: [...(prev[parentId] ?? []), saved],
        }));

        setTopComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c
          )
        );

        setReplies((prev) => {
          const newReplies = { ...prev };
          for (const key in newReplies) {
            newReplies[key] = newReplies[key].map((c) =>
              c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c
            );
          }
          return newReplies;
        });
      }

      setReplyContent("");
      setReplyTo(null);
      setExpanded((prev) => ({ ...prev, [parentId]: true }));
      setShowEmojiPicker(null);
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setPosting(false);
    }
  };

  // =============== STATS ===============
  const totalComments = topComments.reduce(
    (acc, c) => acc + 1 + c.replyCount,
    0
  );
  const totalReplies = topComments.reduce((acc, c) => acc + c.replyCount, 0);

  // =============== FILTERED COMMENTS ===============
  const filteredComments = topComments.filter(
    (c) =>
      c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.userFullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
const replyRate = totalComments > 0 
  ? (totalReplies / totalComments) * 100 
  : 0;

  // =================== RENDER ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                Bình luận & Thảo luận
              </h1>
              <p className="text-gray-600">
                Chia sẻ ý kiến và trao đổi về PTIT IoT Platform
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-700 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-600">Tổng bình luận</p>
                  <p className="text-2xl text-red-900">{totalComments}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-700 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Reply className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600">Phản hồi</p>
                  <p className="text-2xl text-purple-900">{totalReplies}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-700 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600">Hoạt động</p>
                  <p className="text-2xl text-green-900">Cao</p>
                </div>
              </div>
            </motion.div>
              <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-700 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Tỉ lệ phản hồi</p>
                    <p className="text-2xl text-blue-900">{replyRate.toFixed(1)}%</p>
                  </div>
                </div>
              </motion.div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bình luận..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition-all"
            />
          </div>
        </motion.div>

        {/* Main Comment Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-red-100 p-6 mb-8 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <textarea
                value={mainContent}
                onChange={(e) => setMainContent(e.target.value)}
                placeholder="Hãy bình luận có văn hóa..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition-all resize-none"
                rows={3}
              />

              <div className="flex items-center justify-between mt-3">
                <StickerBar
                  onPick={addStickerToMain}
                  show={showMainEmoji}
                  onToggle={() => setShowMainEmoji(!showMainEmoji)}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePostMain}
                  disabled={posting || !mainContent.trim()}
                  className={`px-6 py-2.5 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl flex items-center gap-2 shadow-md transition-all ${
                    posting || !mainContent.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg"
                  }`}
                  type="button"
                >
                  <Send className="w-4 h-4" />
                  {posting ? "Đang gửi..." : "Gửi bình luận"}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments List Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl text-gray-900">
            Bình luận ({filteredComments.length})
          </h3>
        </div>

        {/* Loading State */}
        {loadingTop && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Đang tải bình luận...</p>
          </div>
        )}

        {/* Empty State */}
        {!loadingTop && filteredComments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2">Chưa có bình luận nào</h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Không tìm thấy bình luận nào khớp với từ khóa"
                : "Hãy là người đầu tiên bình luận!"}
            </p>
          </motion.div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {filteredComments.map((c) => (
            <CommentItemRecursive
              key={c.id}
              comment={c}
              isTopLevel={true}
              replies={replies}
              expanded={expanded}
              loadingReply={loadingReply}
              setReplies={setReplies}
              setExpanded={setExpanded}
              setLoadingReply={setLoadingReply}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              setReplyContent={setReplyContent}
              handlePostReply={handlePostReply}
              replyContent={replyContent}
              posting={posting}
              formatDate={formatDate}
              authHeaders={authHeaders}
              addStickerToReply={addStickerToReply}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
            />
          ))}
        </div>
      </div>
    </div>
  );
}