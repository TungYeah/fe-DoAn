import React, { useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, Send, ThumbsUp, Trash2, Edit, MoreVertical } from "lucide-react";

type Comment = {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies?: Comment[];
};

type CommentsSectionProps = {
  entityId: string;
  entityType: string;
};

const initialComments: Comment[] = [
  {
    id: 1,
    userId: 1,
    userName: "Nguyễn Văn An",
    userAvatar: "A",
    text: "Thiết bị này hoạt động rất tốt, độ chính xác cao",
    time: "2 giờ trước",
    likes: 5,
    liked: false,
    replies: [
      {
        id: 2,
        userId: 2,
        userName: "Trần Thị Bình",
        userAvatar: "B",
        text: "Đồng ý, tôi cũng đang sử dụng loại này",
        time: "1 giờ trước",
        likes: 2,
        liked: true,
      },
    ],
  },
  {
    id: 3,
    userId: 3,
    userName: "Lê Minh Cường",
    userAvatar: "C",
    text: "Có ai biết cách cấu hình thiết bị này không?",
    time: "5 giờ trước",
    likes: 3,
    liked: false,
  },
];

export default function CommentsSection({ entityId, entityType }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        userId: 0,
        userName: "Admin User",
        userAvatar: "A",
        text: newComment,
        time: "Vừa xong",
        likes: 0,
        liked: false,
        replies: [],
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  const handleAddReply = (commentId: number) => {
    if (replyText.trim()) {
      const reply: Comment = {
        id: Date.now(),
        userId: 0,
        userName: "Admin User",
        userAvatar: "A",
        text: replyText,
        time: "Vừa xong",
        likes: 0,
        liked: false,
      };

      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        return comment;
      }));

      setReplyText("");
      setReplyingTo(null);
    }
  };

  const handleLike = (commentId: number, isReply: boolean = false, parentId?: number) => {
    if (isReply && parentId) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  liked: !reply.liked,
                  likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      }));
    } else {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return comment;
      }));
    }
  };

  const handleDelete = (commentId: number, isReply: boolean = false, parentId?: number) => {
    if (confirm("Bạn có chắc muốn xóa bình luận này?")) {
      if (isReply && parentId) {
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.filter(reply => reply.id !== commentId),
            };
          }
          return comment;
        }));
      } else {
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-red-600" />
        <h3 className="text-xl text-gray-900">
          Bình luận ({comments.reduce((total, c) => total + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Add Comment */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white flex-shrink-0">
            A
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors resize-none"
            />
            <div className="flex justify-end mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Gửi bình luận
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-gray-200 pb-4 last:border-0"
          >
            {/* Main Comment */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white flex-shrink-0">
                {comment.userAvatar}
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-900">{comment.userName}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{comment.time}</span>
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 mt-2 ml-4">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      comment.liked ? "text-red-600" : "text-gray-600 hover:text-red-600"
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${comment.liked ? "fill-red-600" : ""}`} />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Trả lời
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Xóa
                  </button>
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 ml-4"
                  >
                    <div className="flex items-start gap-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Viết câu trả lời..."
                        rows={2}
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-colors resize-none text-sm"
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Gửi
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-8 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {reply.userAvatar}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm text-gray-900">{reply.userName}</h5>
                              <span className="text-xs text-gray-500">{reply.time}</span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.text}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-1 ml-3">
                            <button
                              onClick={() => handleLike(reply.id, true, comment.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                reply.liked ? "text-red-600" : "text-gray-600 hover:text-red-600"
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${reply.liked ? "fill-red-600" : ""}`} />
                              {reply.likes > 0 && <span>{reply.likes}</span>}
                            </button>
                            <button
                              onClick={() => handleDelete(reply.id, true, comment.id)}
                              className="text-xs text-gray-600 hover:text-red-600 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
