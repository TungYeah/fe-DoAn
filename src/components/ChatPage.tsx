import React, { useState } from "react";
import { ThumbsUp } from "lucide-react";

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
  { id: 1, userId: 1, userName: "Nguyễn Văn An", userAvatar: "A", text: "Mọi người ơi hệ thống IoT chạy ổn chưa?", time: "09:15", likes: 5, liked: false, parentId: null },
  { id: 2, userId: 2, userName: "Trần Thị Bình", userAvatar: "B", text: "@Nguyễn Văn An Tôi test thấy OK rồi!", time: "09:20", likes: 2, liked: false, parentId: 1 },
  { id: 3, userId: 3, userName: "Yến", userAvatar: "Y", text: "@Nguyễn Văn An Bạn oke", time: "14:35", likes: 1, liked: false, parentId: 1 },
  { id: 4, userId: 4, userName: "Phúc", userAvatar: "P", text: "@Nguyễn Văn An T đang kiểm tra lại lần nữa", time: "14:40", likes: 0, liked: false, parentId: 1 },
  { id: 5, userId: 5, userName: "Lê Minh Cường", userAvatar: "C", text: "API sensor có ai nhận dữ liệu bất thường không?", time: "10:01", likes: 0, liked: false, parentId: null },
  { id: 6, userId: 6, userName: "Khoa", userAvatar: "K", text: "@Lê Minh Cường Server bên mình vẫn ổn", time: "10:05", likes: 1, liked: false, parentId: 5 },
];

export default function ChatPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expanded, setExpanded] = useState<number[]>([]); // id các comment cha đang được mở rộng

  const parentComments = comments.filter((c) => c.parentId === null);
  const repliesOf = (id: number) => comments.filter((c) => c.parentId === id);

  const toggleExpand = (id: number) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((x) => x !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  const handleAddReply = (parentId: number) => {
    if (!replyText.trim()) return;

    const parentComment = comments.find((c) => c.id === parentId);

    const reply: Comment = {
      id: Date.now(),
      userId: 999,
      userName: "Admin User",
      userAvatar: "A",
      text: `@${parentComment?.userName} ${replyText}`,
      time: "Vừa xong",
      likes: 0,
      liked: false,
      parentId,
    };

    setComments([...comments, reply]);
    setReplyTo(null);
    setReplyText("");
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
    <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-4xl mx-auto">

      <h2 className="text-2xl font-semibold mb-2">Bình luận</h2>
      <p className="text-gray-500 mb-6">Thảo luận – hỏi đáp – chia sẻ với mọi người</p>

      {/* LIST COMMENT CHA */}
      <div className="space-y-6">
        {parentComments.map((pc) => {
          const replies = repliesOf(pc.id);
          const isExpanded = expanded.includes(pc.id);

          return (
            <div key={pc.id}>

              {/* Comment cha */}
              <CommentItem
                comment={pc}
                isReply={false}
                onReply={() => setReplyTo(pc.id)}
                onLike={() => toggleLike(pc.id)}
              />

              {/* Comment con */}
              <div className="ml-14 mt-3 space-y-3">
                {(isExpanded ? replies : replies.slice(0, 1)).map((r) => (
                  <CommentItem
                    key={r.id}
                    comment={r}
                    isReply={true}
                    onReply={() => setReplyTo(r.id)}
                    onLike={() => toggleLike(r.id)}
                  />
                ))}

                {/* Xem thêm / Thu gọn */}
                {replies.length > 1 && (
                  <button
                    onClick={() => toggleExpand(pc.id)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    {isExpanded
                      ? "Thu gọn phản hồi"
                      : `Xem thêm ${replies.length - 1} phản hồi`}
                  </button>
                )}

                {/* Reply box */}
                {replyTo === pc.id && (
                  <ReplyBox
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onCancel={() => setReplyTo(null)}
                    onSend={() => handleAddReply(pc.id)}
                  />
                )}

                {/* Reply cho reply */}
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
      <div
        className={`rounded-full flex items-center justify-center font-bold text-white ${isReply ? "w-8 h-8 bg-gray-500" : "w-10 h-10 bg-red-600"
          }`}
      >
        {comment.userAvatar}
      </div>

      <div className="flex-1">
        <div className="bg-gray-100 px-4 py-2 rounded-xl inline-block">
          <p className="font-semibold">{comment.userName}</p>
          <p>{comment.text}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 ml-2">
          <span>{comment.time}</span>

          <button onClick={onReply} className="hover:underline">
            Trả lời
          </button>

          <button onClick={onLike} className={`flex items-center gap-1`}>
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
    <div className="ml-4 mt-2">
      <textarea
        rows={1}
        className="w-full border rounded-xl px-3 py-2"
        placeholder="Viết phản hồi..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <div className="flex gap-2 mt-1">
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
