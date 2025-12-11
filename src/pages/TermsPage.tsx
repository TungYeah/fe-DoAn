import { motion } from 'motion/react';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (view: string) => void;
}

export default function TermsPage({ onNavigate }: TermsPageProps) {
  const sections = [
    {
      title: '1. Chấp Nhận Điều Khoản',
      content: 'Bằng việc truy cập và sử dụng PTIT IoT Platform, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện được nêu trong tài liệu này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.',
    },
    {
      title: '2. Điều Kiện Sử Dụng',
      content: 'Nền tảng này được thiết kế dành riêng cho sinh viên, giảng viên và các đơn vị nghiên cứu của Học viện Công nghệ Bưu chính Viễn thông. Người dùng phải sử dụng email @ptit.edu.vn để đăng ký và xác thực tài khoản. Mỗi cá nhân chỉ được tạo một tài khoản duy nhất.',
    },
    {
      title: '3. Quyền và Trách Nhiệm Người Dùng',
      content: 'Không chia sẻ API key; đảm bảo dữ liệu gửi lên là hợp lệ và không gây hại hệ thống.',
    },
    {
      title: '4. Nội Dung và Dữ Liệu',
      content: 'Người dùng giữ quyền sở hữu đối với dữ liệu của mình. PTIT IoT Platform cam kết không chia sẻ, bán hoặc sử dụng dữ liệu cá nhân của bạn cho mục đích thương mại. Tuy nhiên, chúng tôi có quyền sử dụng dữ liệu tổng hợp (không định danh) cho mục đích nghiên cứu và cải thiện dịch vụ.',
    },
    {
      title: '5. Hành Vi Cấm',
      content: 'Người dùng không được: (a) Sử dụng nền tảng cho mục đích bất hợp pháp; (b) Tấn công, làm gián đoạn hoặc cố gắng truy cập trái phép vào hệ thống; (c) Tải lên nội dung độc hại, vi phạm pháp luật hoặc xâm phạm quyền của người khác; (d) Spam hoặc gửi dữ liệu quá mức làm quá tải hệ thống.',
    },
    {
      title: '6. Giới Hạn Dịch Vụ',
      content: 'Chúng tôi cung cấp các gói dịch vụ với giới hạn về số lượng thiết bị, dung lượng lưu trữ và số lượng request. Việc vượt quá giới hạn có thể dẫn đến tạm ngưng dịch vụ hoặc yêu cầu nâng cấp gói.',
    },
    {
      title: '7. Bảo Mật',
      content: 'Chúng tôi cam kết bảo vệ dữ liệu của bạn bằng các biện pháp bảo mật tiêu chuẩn công nghiệp. Tuy nhiên, không có hệ thống nào là an toàn tuyệt đối. Chúng tôi khuyến nghị bạn sử dụng mật khẩu mạnh và bật xác thực hai yếu tố.',
    },
    {
      title: '8. Thay Đổi Dịch Vụ',
      content: 'Chúng tôi có quyền thay đổi, tạm ngưng hoặc ngừng cung cấp bất kỳ phần nào của dịch vụ mà không cần thông báo trước. Chúng tôi sẽ cố gắng thông báo trước cho người dùng về các thay đổi quan trọng.',
    },
    {
      title: '9. Chấm Dứt Tài Khoản',
      content: 'Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm điều khoản sử dụng. Bạn cũng có quyền yêu cầu xóa tài khoản bất cứ lúc nào thông qua tính năng trong phần cài đặt.',
    },
    {
      title: '10. Giới Hạn Trách Nhiệm',
      content: 'PTIT IoT Platform được cung cấp "nguyên trạng" mà không có bất kỳ bảo đảm nào. Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất dữ liệu, thiệt hại hoặc gián đoạn dịch vụ nào có thể xảy ra.',
    },
    {
      title: '11. Quyền Sở Hữu Trí Tuệ',
      content: 'Tất cả nội dung, thiết kế, logo, code và tài liệu của PTIT IoT Platform đều thuộc quyền sở hữu của Học viện Công nghệ Bưu chính Viễn thông và được bảo vệ bởi luật sở hữu trí tuệ.',
    },
    {
      title: '12. Liên Hệ',
      content: 'Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua email iot@ptit.edu.vn hoặc thông qua trang Liên hệ.',
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
              <p className="text-xs text-gray-600">Điều Khoản Sử Dụng</p>
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
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 justify-center shadow-2xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
            Điều Khoản Sử Dụng
          </h2>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-8 flex gap-4"
        >
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-yellow-800 mb-2">Lưu Ý Quan Trọng</h3>
            <p className="text-yellow-700 text-sm">
              Vui lòng đọc kỹ các điều khoản sử dụng này trước khi sử dụng nền tảng. 
              Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các điều khoản này.
            </p>
          </div>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden"
        >
          <div className="p-8 space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="pb-8 border-b border-gray-200 last:border-b-0 last:pb-0"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed ml-9">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center shadow-2xl"
        >
          <Shield className="w-10 h-10 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Có Câu Hỏi Về Điều Khoản?</h3>
          <p className="text-red-50 mb-6">
            Liên hệ với chúng tôi để được giải đáp mọi thắc mắc
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
              onClick={() => onNavigate('privacy')}
              className="px-8 py-3 bg-red-800 text-white rounded-lg border-2 border-white/30 hover:bg-red-900 transition-all"
            >
              Chính sách bảo mật
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
