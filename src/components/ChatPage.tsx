import React, { useEffect, useState } from "react";
import { Reply, SmilePlus } from "lucide-react";

const API_BASE = "http://localhost:8080";

// Độ thụt lề bằng phần trăm theo yêu cầu (30%)
const INDENT_PERCENTAGE = "6%";

const INDENT_PERCENTAGES = "5%";

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

const STICKERS = ["😂", "🤣", "😎", "😍", "👍", "🔥"];

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
};


/* ======================================================
   COMPONENT: Sticker Bar (Phụ)
====================================================== */
const StickerBar = ({ onPick }: { onPick: (s: string) => void }) => (
  <div className="flex items-center gap-2 mt-2 text-xl">
    <SmilePlus className="w-4 h-4 text-gray-500" />
    {STICKERS.map((s) => (
      <button
        key={s}
        onClick={() => onPick(s)}
        className="hover:scale-110 transition-transform"
      >
        {s}
      </button>
    ))}
  </div>
);

/* ======================================================
   COMPONENT: Reply Box (Phụ)
====================================================== */
function ReplyBox({
  value,
  onChange,
  onCancel,
  onSend,
  disabled,
  stickerBar,
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSend: () => void;
  disabled: boolean;
  stickerBar: React.ReactNode;
}) {
  // Để ReplyBox thụt vào bằng với nội dung (cách avatar + gap, tức là 56px)
  const INDENT_FIXED_CLASS = "ml-14";

  return (
    <div className="mt-3">
      <textarea
        rows={2}
        className="w-full border rounded-xl px-3 py-2 shadow-sm"
        placeholder="Viết phản hồi…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {stickerBar}

      <div className={`flex gap-2 mt-2 ${INDENT_FIXED_CLASS}`}>
        <button
          onClick={onSend}
          disabled={disabled}
          className={`px-4 py-1 bg-blue-600 text-white rounded-lg ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
        >
          Gửi
        </button>

        <button
          onClick={onCancel}
          className="px-4 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

/* ======================================================
   COMPONENT: Comment Item RECURSIVE (Chính)
====================================================== */
function CommentItemRecursive({
  comment,
  isTopLevel,
  ...props
}: {
  comment: Comment;
  isTopLevel: boolean;
} & ReplyProps) {
  const API_BASE = "http://localhost:8080";

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

  // Fixed indent for buttons/reply box (Avatar 40px + Gap 12px = 52px, dùng ml-14 = 56px)
  const INDENT_FIXED_CLASS = "ml-14";

  const loadReplies = async (forceReload = false) => {
    if (props.replies[comment.id] && !forceReload) {
      props.setExpanded((prev) => ({ ...prev, [comment.id]: true }));
      return;
    }

    try {
      props.setLoadingReply((prev) => ({ ...prev, [comment.id]: true }));

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

      props.setExpanded((prev) => ({ ...prev, [comment.id]: true }));
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
  }

  const cancelReply = () => {
    props.setReplyTo(null);
  }

  const sendReply = () => {
    props.handlePostReply(comment.id);
  }

  // ÁP DỤNG THỤT LỀ BẰNG INLINE STYLE CHO COMMENT CON
  const styleIndent = isTopLevel ? {} : { paddingLeft: INDENT_PERCENTAGE };

  // Đường kẻ dọc sẽ được căn chỉnh bằng giá trị cố định (ví dụ 30px) so với lề trái của container comment con.
  const verticalLinePosition = isTopLevel ? "left-[-30px]" : "left-[-30px]";

  return (
    // Container chính của comment, áp dụng thụt lề bằng style cho comment con
    <div className="relative" style={styleIndent}>

      {/* 1. KHỐI AVATAR VÀ NỘI DUNG */}
      <div className={`flex gap-3`}>

        {/* Đường kẻ nhánh chỉ xuất hiện cho comment con */}
        {!isTopLevel && (
          // Sử dụng giá trị cố định cho vị trí đường kẻ (ví dụ left-[-30px])
          <div className={`absolute top-0 ${verticalLinePosition} h-full w-px bg-gray-300`}></div>
        )}

        <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center flex-shrink-0">
          {comment.userAvatar ? (
            <img
              src={comment.userAvatar}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            avatarLetter
          )}
        </div>

        <div className="flex-1">
          <div className="bg-gray-50 px-4 py-2 rounded-xl shadow-sm border">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-800">{displayName}</span>
              {/* Chỗ này cần logic để hiển thị tên người được reply. */}
              {comment.parentId && <span className="text-xs text-blue-600 font-medium"> @[User Parent]</span>}
              {props.formatDate(comment) && <span className="text-xs text-gray-400">• {props.formatDate(comment)}</span>}
            </div>
            <p>{comment.content}</p>
          </div>

          <button
            onClick={startReply}
            className="text-sm text-gray-500 mt-1 flex items-center gap-1 hover:underline"
          >
            <Reply size={14} />
            Trả lời
          </button>
        </div>
      </div>

      {/* 2. CONTAINER CHỨA NÚT EXPAND VÀ REPLIES (Nằm ngay dưới khối nội dung) */}
      <div className={`mt-2 space-y-3`}>

        {/* NÚT EXPAND/COLLAPSE - Thụt lề cố định 56px (ml-14) để căn chỉnh với vị trí Avatar + Gap */}
        {comment.replyCount > 0 && (
          <button
            onClick={toggleExpand}
            className="text-blue-600 text-sm hover:underline"
            style={{ paddingLeft: INDENT_PERCENTAGES }}

          >
            {isLoading
              ? "Đang tải..."
              : isExpanded
                ? "Thu gọn phản hồi"
                : `Xem ${comment.replyCount} phản hồi`}
          </button>
        )}

        {/* RENDER REPLY (ĐỆ QUY) */}
        {isExpanded && repliesOfThis.map((r) => (
          // Lớp đệ quy tiếp theo sẽ tự động áp dụng thụt lề 30% cho chính nó.
          <CommentItemRecursive
            key={r.id}
            comment={r}
            isTopLevel={false}
            {...props}
          />
        ))}

        {/* INPUT REPLY */}
        {isReplying && (
          <div className={`${INDENT_FIXED_CLASS}`}>
            <ReplyBox
              value={props.replyContent}
              onChange={props.setReplyContent}
              onCancel={cancelReply}
              onSend={sendReply}
              disabled={props.posting || !props.replyContent.trim()}
              stickerBar={<StickerBar onPick={props.addStickerToReply} />}
            />
          </div>
        )}
      </div>
    </div>
  );
}


export default function ChatPage() {
  const [topComments, setTopComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<ReplyMap>({});
  const [expanded, setExpanded] = useState<BooleanMap>({});

  const [mainContent, setMainContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingReply, setLoadingReply] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState(false);

  const token = localStorage.getItem("token");

  // =============== UTIL ===============
  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
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

      const res = await fetch(
        `${API_BASE}/api/v1/comments/toplevel?page=0&size=20`,
        { headers: authHeaders() }
      );

      const data = await res.json();
      const list: Comment[] = data.content ?? [];

      setTopComments(list);
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

      setMainContent("");
    } finally {
      setPosting(false);
    }
  };

  // =============== POST REPLY (Hỗ trợ Đệ quy) ===============
  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim() || posting) return;

    try {
      setPosting(true);

      const res = await fetch(`${API_BASE}/api/v1/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId,
        }),
      });

      const saved: Comment = await res.json();

      // 1. Cập nhật Replies Map
      setReplies((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] ?? []), saved],
      }));

      // 2. Cập nhật replyCount trên Comment Cha (tìm trong cả topComments và replies)
      setTopComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replyCount: c.replyCount + 1 }
            : c
        )
      );

      setReplies((prev) => {
        const newReplies = { ...prev };
        for (const key in newReplies) {
          newReplies[key] = newReplies[key].map((c) =>
            c.id === parentId
              ? { ...c, replyCount: c.replyCount + 1 }
              : c
          );
        }
        return newReplies;
      });


      setReplyContent("");
      setReplyTo(null);
      setExpanded((prev) => ({ ...prev, [parentId]: true }));
    } finally {
      setPosting(false);
    }
  };

  // =================== RENDER ===================
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg">

      {/* MAIN INPUT */}
      <textarea
        value={mainContent}
        onChange={(e) => setMainContent(e.target.value)}
        placeholder="Hãy bình luận có văn hóa…"
        className="w-full border rounded-lg p-3 mb-2 shadow-sm"
        rows={3}
      />
      <StickerBar onPick={addStickerToMain} />

      <button
        onClick={handlePostMain}
        disabled={posting || !mainContent.trim()}
        className={`mt-3 px-6 py-2 bg-red-600 text-white rounded-lg ${posting || !mainContent.trim()
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-red-700"
          }`}
      >
        {posting ? "Đang gửi..." : "Gửi bình luận"}
      </button>

      <h3 className="text-xl font-semibold mt-8 mb-4">Bình luận</h3>

      {loadingTop && <p className="text-gray-500">Đang tải...</p>}
      {!loadingTop && topComments.length === 0 && (
        <p className="text-gray-500">Chưa có bình luận nào.</p>
      )}

      {/* LIST COMMENTS (SỬ DỤNG COMPONENT ĐỆ QUY) */}
      <div className="space-y-6">
        {topComments.map((c) => (
          <CommentItemRecursive
            key={c.id}
            comment={c}
            isTopLevel={true} // Comment cấp 1
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
          />
        ))}
      </div>
    </div>
  );
}