import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  Search,
} from "lucide-react";

interface FAQPageProps {
  onNavigate: (view: string) => void;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage({ onNavigate }: FAQPageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [open, setOpen] = useState<number | null>(null);

  const categories = [
    { id: "all", label: "Tất cả" },
    { id: "general", label: "Chung" },
    { id: "technical", label: "Kỹ thuật" },
    { id: "account", label: "Tài khoản" },
    { id: "pricing", label: "Giá cả" },
  ];

const faqs: FAQ[] = [
  {
    category: "general",
    question: "Nền tảng IoT Data Lake dùng để làm gì?",
    answer: "Nền tảng hỗ trợ thu thập, lưu trữ và chia sẻ dữ liệu cảm biến phục vụ huấn luyện mô hình AI on Sensor.",
  },
  {
    category: "technical",
    question: "Làm thế nào để thiết bị gửi dữ liệu?",
    answer: "Thiết bị có thể gửi dữ liệu qua HTTP hoặc MQTT bằng API key do hệ thống cấp.",
  },
  {
    category: "technical",
    question: "Tôi có thể tải dữ liệu để train AI không?",
    answer: "Có. Hệ thống hỗ trợ export CSV/JSON để đưa vào pipeline machine learning.",
  },
  {
    category: "account",
    question: "Dữ liệu có được phân quyền không?",
    answer: "Có. Dataset có thể chia sẻ theo người dùng hoặc nhóm nghiên cứu.",
  },
  {
    category: "general",
    question: "Nền tảng lưu trữ dữ liệu ở đâu?",
    answer: "Dữ liệu được lưu trong MinIO Data Lake nội bộ của hệ thống.",
  },
  {
    category: "general",
    question: "Nền tảng có miễn phí không?",
    answer: "Miễn phí cho sinh viên và giảng viên PTIT.",
  },
];


  const filteredFAQs = faqs.filter((f) => {
    const matchCategory = activeCategory === "all" || f.category === activeCategory;
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">

      {/* HEADER */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-red-700 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-lg">PTIT</span>
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                PTIT IoT Platform
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">FAQ • Hỏi & đáp</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-medium">Quay lại</span>
          </motion.button>
        </div>
      </motion.header>

      {/* MAIN */}
      <main class="relative z-10 max-w-7xl mx-auto px-6 py-16">

        {/* HERO */}
                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 justify-center shadow-2xl">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Mọi câu hỏi phổ biến về nền tảng đều nằm ở đây — tìm nhanh, xem nhanh, hiểu ngay.
          </p>
        </motion.div>
        {/* SEARCH BAR */}
        <div className="relative mb-10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="   Tìm kiếm câu hỏi..."
            className="w-full pl-14 pr-4 py-4 bg-white border-2 border-red-100 rounded-2xl shadow-md focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>
<br></br>
        {/* CATEGORIES */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === c.id
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-white border-2 border-red-100 text-gray-700 hover:border-red-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
<br></br>

        {/* FAQ LIST */}
        <div className="space-y-6">
          {filteredFAQs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-380px bg-white rounded-xl border border-red-100 shadow-md hover:shadow-lg transition-all p-4"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-gray-800">{faq.question}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-6 h-6 text-red-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 pb-5 text-gray-600 border-t border-red-100 leading-relaxed"
                  ><br></br>
                    {faq.answer}<br></br>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
<br></br>
        {/* CTA SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-center text-white shadow-2xl"
        >
          <MessageCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-2">Vẫn còn thắc mắc?</h3>

          <p className="text-red-100 mb-6">
            Chúng tôi sẵn sàng hỗ trợ bạn bất cứ lúc nào.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => onNavigate("contact")}
              className="px-8 py-3 bg-white text-red-600 rounded-xl font-medium hover:shadow-xl transition-all"
            >
              Liên hệ ngay
            </button>

            <button
              onClick={() => onNavigate("help")}
              className="px-8 py-3 bg-red-800 border border-white/20 rounded-xl hover:bg-red-900 transition-all"
            >
              Trung tâm trợ giúp
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
