import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Target, Award, Heart, Building2, Rocket, TrendingUp } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);
  }, []);

  const stats = [
    { icon: Users, label: 'Sinh viên', value: '30,000+', color: 'from-red-500 to-red-600' },
    { icon: Building2, label: 'Khoa/Viện', value: '12+', color: 'from-red-600 to-red-700' },
    { icon: Award, label: 'Giải thưởng', value: '50+', color: 'from-red-700 to-red-800' },
    { icon: Rocket, label: 'Dự án IoT', value: '200+', color: 'from-red-500 to-red-700' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Sứ Mệnh',
      desc: 'Xây dựng hạ tầng dữ liệu IoT phục vụ giảng dạy, nghiên cứu và phát triển.',
      color: 'bg-red-50 border-red-200',
    },
    {
      icon: Heart,
      title: 'Giá Trị Cốt Lõi',
      desc: 'Đổi mới sáng tạo, chất lượng, hợp tác và phát triển bền vững',
      color: 'bg-red-100 border-red-300',
    },
    {
      icon: TrendingUp,
      title: 'Tầm Nhìn',
      desc: 'Trở thành nền tảng thu thập, chia sẻ dữ liệu IoT hàng đầu cho sinh viên và giảng viên PTIT',
      color: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-red-400/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg"
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
              <p className="text-xs text-gray-600">Giới Thiệu</p>
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
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
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
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
            Về PTIT IoT Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nền tảng Data Lake dành cho IoT hỗ trợ thu thập – lưu trữ – phân tích dữ liệu 
cảm biến phục vụ huấn luyện mô hình AI on Sensor, nghiên cứu khoa học và 
giảng dạy tại Học viện Công nghệ Bưu chính Viễn thông.

          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-red-100"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
            Giá Trị Của Chúng Tôi
          </h3><br></br>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`${value.color} rounded-2xl p-8 border-2 shadow-lg`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Story Section
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-3xl p-10 shadow-xl border border-red-100"
        >
          <h3 className="text-3xl font-bold mb-6 text-gray-800">Câu Chuyện Của Chúng Tôi</h3>
          <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
            <p>
              PTIT IoT Platform được sinh ra từ nhu cầu thực tế của sinh viên và giảng viên tại Học viện Công nghệ 
              Bưu chính Viễn thông trong việc nghiên cứu và triển khai các dự án IoT.
            </p>
            <p>
              Với sự phát triển mạnh mẽ của công nghệ IoT, chúng tôi nhận thấy cần có một nền tảng chuyên nghiệp, 
              dễ sử dụng và phù hợp với môi trường giáo dục Việt Nam.
            </p>
            <p>
              Nền tảng của chúng tôi không chỉ là công cụ quản lý dữ liệu, mà còn là cầu nối giữa lý thuyết và thực hành, 
              giúp sinh viên phát triển kỹ năng thực tế trong lĩnh vực IoT.
            </p>
          </div>
        </motion.div>
         */}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 text-center bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-12 text-white shadow-2xl"
        >
          <h3 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h3>
          <p className="text-xl mb-8 text-red-50">
            Tham gia cùng hàng ngàn sinh viên và giảng viên đang sử dụng PTIT IoT Platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('register')}
              className="px-8 py-4 bg-white text-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Đăng ký ngay
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 bg-red-800 text-white rounded-xl border-2 border-white/30 hover:bg-red-900 transition-all"
            >
              Liên hệ chúng tôi
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            &copy; 2025 PTIT IoT Platform. Học viện Công nghệ Bưu chính Viễn thông.
          </p>
        </div>
      </footer>
    </div>
  );
}
