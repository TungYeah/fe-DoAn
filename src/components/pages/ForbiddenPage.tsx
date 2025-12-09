import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, AlertTriangle, Home, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface ForbiddenPageProps {
  onNavigate: (page: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function ForbiddenPage({ onNavigate }: ForbiddenPageProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

  useEffect(() => {
    // Generate floating particles
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden">
      {/* Floating Particles Background */}
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
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-red-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* PTIT Logo - Top Left */}
      <motion.div
        className="absolute top-8 left-8 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">PTIT</span>
          </div>
          <div>
            <div className="text-sm font-bold text-red-600">PTIT IoT</div>
            <div className="text-xs text-gray-600">Platform</div>
          </div>
        </div>
      </motion.div>

      {/* PTIT Logo - Top Right */}
      <motion.div
        className="absolute top-8 right-8 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">PTIT</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl w-full">
          {/* Lock Shield Animation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              duration: 0.8,
            }}
          >
            <motion.div
              className="relative"
              animate={{
                x: mousePosition.x,
                y: mousePosition.y,
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 10 }}
            >
              <div className="relative">
                {/* Pulsing Ring */}
                <motion.div
                  className="absolute inset-0 -m-4 bg-red-500/20 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Shield Icon */}
                <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-8 rounded-3xl shadow-2xl">
                  <Shield className="w-24 h-24 text-white" strokeWidth={1.5} />
                  
                  {/* Lock Overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <div className="bg-white rounded-full p-3">
                      <Lock className="w-8 h-8 text-red-600" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.h1
              className="text-9xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              403
            </motion.h1>
          </motion.div>

          {/* Error Message */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Truy Cập Bị Từ Chối
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              Xin lỗi, bạn không có quyền truy cập trang này.
            </p>
            <p className="text-gray-500">
              Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
            </p>
          </motion.div>
          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.button
onClick={() => navigate("/dashboard/")}
              className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(220, 38, 38, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Về Dashboard
              </span>
            </motion.button>

            <motion.button
              onClick={() => window.history.back()}
              className="group px-8 py-4 bg-white text-gray-700 rounded-xl shadow-lg border-2 border-gray-200 hover:border-red-300"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                <span className="group-hover:text-red-600 transition-colors">Quay Lại</span>
              </span>
            </motion.button>
          </motion.div>

          {/* Warning Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Mọi hành động đều được ghi lại để đảm bảo an toàn hệ thống
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Decorative Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { Icon: Lock, x: '10%', y: '20%', delay: 0 },
          { Icon: Shield, x: '85%', y: '30%', delay: 0.5 },
          { Icon: Eye, x: '15%', y: '70%', delay: 1 },
          { Icon: AlertTriangle, x: '80%', y: '75%', delay: 1.5 },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-red-200/30"
            style={{
              left: item.x,
              top: item.y,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <item.Icon className="w-12 h-12" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
