import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, AlertCircle } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (view: string) => void;
}

export default function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  const privacyPoints = [
    {
      icon: Database,
      title: 'Thu Thập Dữ Liệu',
      desc: 'Chúng tôi thu thập thông tin cá nhân (tên, email) khi bạn đăng ký tài khoản và dữ liệu IoT từ thiết bị của bạn. Tất cả dữ liệu được mã hóa và lưu trữ an toàn.',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Lock,
      title: 'Bảo Mật Dữ Liệu',
      desc: 'Dữ liệu của bạn được bảo vệ bằng mã hóa SSL/TLS. Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn công nghiệp để ngăn chặn truy cập trái phép.',
      color: 'from-red-600 to-red-700',
    },
    {
      icon: Eye,
      title: 'Sử Dụng Dữ Liệu',
      desc: 'Dữ liệu của bạn chỉ được sử dụng để cung cấp và cải thiện dịch vụ. Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba.',
      color: 'from-red-700 to-red-800',
    },
    {
      icon: UserCheck,
      title: 'Quyền Của Bạn',
      desc: 'Bạn có quyền truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình bất cứ lúc nào. Bạn cũng có thể yêu cầu xuất toàn bộ dữ liệu của mình.',
      color: 'from-red-500 to-red-700',
    },
  ];

  const dataTypes = [
    {
      title: 'Thông Tin Cá Nhân',
      items: ['Họ và tên', 'Email @ptit.edu.vn', 'Khoa/Viện'],
    },
    {
      title: 'Dữ Liệu Thiết Bị',
      items: ['ID thiết bị', 'Loại thiết bị', 'Dữ liệu cảm biến', 'Thời gian gửi'],
    },
    {
      title: 'Dữ Liệu Sử Dụng',
      items: ['Lịch sử đăng nhập', 'Hoạt động trên nền tảng', 'Thông tin trình duyệt'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">PTIT</span>
            </div>
            <div>
              <h1 className="font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                PTIT IoT Platform
              </h1>
              <p className="text-xs text-gray-600">Chính Sách Bảo Mật</p>
            </div>
          </div>
          <motion.button
            onClick={() => onNavigate('landing')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-200 hover:border-red-400 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-red-600" />
            <span className="text-red-600">Quay lại</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 justify-center shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
            Chính Sách Bảo Mật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu của bạn
          </p>
        </motion.div>

        {/* Privacy Points Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {privacyPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-red-100"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${point.color} rounded-xl flex items-center justify-center mb-4`}>
                <point.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{point.title}</h3>
              <p className="text-gray-600 leading-relaxed">{point.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Data Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
            Loại Dữ Liệu Chúng Tôi Thu Thập
          </h3><br></br>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {dataTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 border-2 border-red-100 shadow-lg"
              >
                <h4 className="text-lg font-bold text-gray-900 mb-4"><b>{type.title}</b></h4>
                <ul className="space-y-2">
                  {type.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 mb-8 space-y-8"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Cookies</h3>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng, lưu trữ thông tin đăng nhập và phân tích 
              việc sử dụng nền tảng. Bạn có thể quản lý cookies thông qua cài đặt trình duyệt của mình.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Chia Sẻ Dữ Liệu Với Bên Thứ Ba</h3>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi KHÔNG bán hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba cho mục đích thương mại. 
              Dữ liệu chỉ được chia sẻ khi:
            </p>
            <ul className="mt-3 space-y-2 ml-6">
              <li className="text-gray-600">• Có yêu cầu từ cơ quan pháp luật</li>
              <li className="text-gray-600">• Cần thiết để bảo vệ quyền lợi của chúng tôi hoặc người khác</li>
              <li className="text-gray-600">• Bạn cho phép rõ ràng việc chia sẻ</li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Lưu Trữ Dữ Liệu</h3>
            <p className="text-gray-600 leading-relaxed">
              Dữ liệu của bạn được lưu trữ trên các server an toàn tại Việt Nam. Chúng tôi lưu giữ dữ liệu cho đến khi 
              bạn yêu cầu xóa tài khoản hoặc theo quy định pháp luật.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Quyền Của Người Dùng</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              Theo luật pháp Việt Nam và các chuẩn mực quốc tế, bạn có các quyền sau:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="text-gray-600">• Quyền truy cập dữ liệu cá nhân của bạn</li>
              <li className="text-gray-600">• Quyền chỉnh sửa hoặc cập nhật thông tin</li>
              <li className="text-gray-600">• Quyền xóa tài khoản và dữ liệu</li>
              <li className="text-gray-600">• Quyền xuất dữ liệu dưới định dạng CSV/JSON</li>
              <li className="text-gray-600">• Quyền phản đối việc xử lý dữ liệu</li>
            </ul>
          </div>

        </motion.div>

        {/* Warning Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8 flex gap-4"
        >
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-800 mb-2">Thay Đổi Chính Sách</h3>
            <p className="text-blue-700 text-sm">
              Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Những thay đổi quan trọng sẽ được 
              thông báo qua email hoặc thông báo trên nền tảng.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-10 text-white text-center shadow-2xl"
        >
          <Lock className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Có Thắc Mắc Về Quyền Riêng Tư?</h3>
          <p className="text-red-50 mb-6">
            Liên hệ với chúng tôi để được tư vấn chi tiết về chính sách bảo mật
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('contact')}
              className="px-8 py-3 bg-white text-red-600 rounded-lg hover:shadow-xl transition-all"
            >
              Liên hệ ngay
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('terms')}
              className="px-8 py-3 bg-red-800 text-white rounded-lg border-2 border-white/30 hover:bg-red-900 transition-all"
            >
              Điều khoản sử dụng
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
