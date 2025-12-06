import React, { useState } from "react";
import { ThumbsUp, Reply } from "lucide-react";

type Comment = {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  parentId: number | null;
};

const initialComments: Comment[] = [
  {
    id: 1,
    userId: 1,
    userName: "Cấp 3",
    userAvatar: "Q",
    text: "Đã đọc 100 chap novel free thì tôi sẽ đánh giá nó là mì ăn liền...",
    time: "1 Tháng Trước",
    likes: 0,
    liked: false,
    parentId: null,
  },
  {
    id: 2,
    userId: 2,
    userName: "Kuro",
    userAvatar: "K",
    text: "Đọc xong mười mấy chap mới ra rồi đấy...",
    time: "1 Tháng Trước",
    likes: 0,
    liked: false,
    parentId: 1,
  },
  {
    id: 3,
    userId: 3,
    userName: "Cấp 3",
    userAvatar: "Q",
    text: "Khác mỗi cái chức nghiệp thôi chứ...",
    time: "1 Tháng Trước",
    likes: 0,
    liked: false,
    parentId: 1,
  },
];

export default function ChatPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [mainComment, setMainComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);

  const parentComments = comments.filter((c) => c.parentId === null);
  const repliesOf = (id: number) => comments.filter((c) => c.parentId === id);

  const toggleExpand = (id: number) => {
    expanded.includes(id)
      ? setExpanded(expanded.filter((x) => x !== id))
      : setExpanded([...expanded, id]);
  };

  const addMainComment = () => {
    if (!mainComment.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      userId: 999,
      userName: "Bạn đọc",
      userAvatar: "B",
      text: mainComment,
      time: "Vừa xong",
      likes: 0,
      liked: false,
      parentId: null,
    };

    setComments([newComment, ...comments]);
    setMainComment("");
  };

  const handleAddReply = (parentId: number) => {
    if (!replyText.trim()) return;

    const parent = comments.find((c) => c.id === parentId);

    const reply: Comment = {
      id: Date.now(),
      userId: 999,
      userName: "Bạn đọc",
      userAvatar: "B",
      text: `@${parent?.userName} ${replyText}`,
      time: "Vừa xong",
      likes: 0,
      liked: false,
      parentId,
    };

    setComments([...comments, reply]);
    setReplyText("");
    setReplyTo(null);
    if (!expanded.includes(parentId)) setExpanded([...expanded, parentId]);
  };

  const toggleLike = (id: number) =>
    setComments(
      comments.map((c) =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">

      {/* COMMENT INPUT */}
      <textarea
        value={mainComment}
        onChange={(e) => setMainComment(e.target.value)}
        placeholder="Hãy bình luận có văn hóa để tránh bị khóa tài khoản…"
        className="w-full border rounded-lg p-3 mb-4 shadow-sm focus:ring focus:ring-red-200"
        rows={2}
      />

      <button
        onClick={addMainComment}
        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Gửi bình luận
      </button>

      <h3 className="text-xl font-semibold mt-6 mb-4">Bình luận</h3>

      <div className="space-y-6">
        {parentComments.map((pc) => {
          const replies = repliesOf(pc.id);
          const isExpanded = expanded.includes(pc.id);

          return (
            <div key={pc.id}>
              <CommentItem
                comment={pc}
                isReply={false}
                onReply={() => setReplyTo(pc.id)}
                onLike={() => toggleLike(pc.id)}
              />

              {/* REPLIES */}
              <div className="ml-12 mt-2 space-y-3">
                {isExpanded && replies.map((r) => (
                  <CommentItem
                    key={r.id}
                    comment={r}
                    isReply={true}
                    onReply={() => setReplyTo(r.id)}
                    onLike={() => toggleLike(r.id)}
                  />
                ))}

                {replies.length > 0 && (
                  <button
                    onClick={() => toggleExpand(pc.id)}
                    className="text-blue-600 text-sm hover:underline ml-3"
                  >
                    {isExpanded
                      ? "Thu gọn phản hồi"
                      : `Xem ${replies.length} phản hồi`}
                  </button>
                )}

                {/* Reply Box */}
                {replyTo === pc.id && (
                  <ReplyBox
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onCancel={() => setReplyTo(null)}
                    onSend={() => handleAddReply(pc.id)}
                  />
                )}

                {replies.map((r) =>
                  replyTo === r.id ? (
                    <ReplyBox
                      key={"replybox-" + r.id}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      onCancel={() => setReplyTo(null)}
                      onSend={() => handleAddReply(r.id)}
                    />
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------- COMMENT ITEM ---------------------- */

function CommentItem({
  comment,
  isReply,
  onReply,
  onLike,
}: {
  comment: Comment;
  isReply: boolean;
  onReply: () => void;
  onLike: () => void;
}) {
  return (
    <div className={`flex gap-3 ${isReply ? "ml-2" : ""}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-orange-200 text-orange-800 font-bold flex items-center justify-center shadow-sm">
        {comment.userAvatar}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-gray-100 px-4 py-2 rounded-xl shadow-sm">
          <p className="font-semibold text-orange-700">{comment.userName}</p>
          <p className="leading-relaxed">{comment.text}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 ml-1">
          <span>{comment.time}</span>

          <button onClick={onReply} className="hover:underline flex items-center gap-1">
            <Reply size={14} />
            Trả lời
          </button>

          <button onClick={onLike} className="flex items-center gap-1">
            <ThumbsUp
              size={14}
              className={comment.liked ? "text-blue-600" : "text-gray-600"}
            />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- REPLY BOX ---------------------- */

function ReplyBox({
  replyText,
  setReplyText,
  onCancel,
  onSend,
}: {
  replyText: string;
  setReplyText: (value: string) => void;
  onCancel: () => void;
  onSend: () => void;
}) {
  return (
    <div className="ml-4 mt-3">
      <textarea
        rows={1}
        className="w-full border rounded-xl px-3 py-2 shadow-sm"
        placeholder="Viết phản hồi…"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <button onClick={onSend} className="px-4 py-1 bg-blue-600 text-white rounded-lg">
          Gửi
        </button>
        <button onClick={onCancel} className="px-4 py-1 bg-gray-200 rounded-lg">
          Hủy
        </button>
      </div>
    </div>
  );
}
