import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  ArrowLeft,
  Search,
  Sparkles,
  Star,
  Zap,
  Heart,
  Rocket,
  Shield,
  Server,
  Key,
  Lock,
  Crown,
  Diamond,
  Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced floating particle with 3D effects
const FloatingParticle: React.FC<{
  delay: number;
  duration: number;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  size?: string;
}> = ({ delay, duration, Icon, color, size = "w-4 h-4" }) => (
  <motion.div
    className={`absolute ${color} pointer-events-none`}
    initial={{
      opacity: 0,
      y: 100,
      x: Math.random() * 100,
      rotateX: 0,
      rotateY: 0,
      scale: 0,
    }}
    animate={{
      opacity: [0, 1, 0.8, 0],
      y: [-100, -200, -300, -400],
      x: Math.random() * 200 - 100,
      rotateX: [0, 360, 720],
      rotateY: [0, 180, 360],
      scale: [0, 1, 1.2, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
    style={{
      filter: "drop-shadow(0 0 10px currentColor)",
    }}
  >
    <Icon className={size} />
  </motion.div>
);

// Advanced holographic text with multiple layers
const HolographicText: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <motion.div className={cn("relative", className)}>
    {/* Main text */}
    <motion.div
      className="relative z-10"
      animate={{
        textShadow: [
          "0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(59, 130, 246, 0.3), 0 0 60px rgba(236, 72, 153, 0.2)",
          "0 0 30px rgba(236, 72, 153, 0.5), 0 0 50px rgba(147, 51, 234, 0.3), 0 0 70px rgba(59, 130, 246, 0.2)",
          "0 0 25px rgba(59, 130, 246, 0.5), 0 0 45px rgba(236, 72, 153, 0.3), 0 0 65px rgba(147, 51, 234, 0.2)",
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>

    {/* Holographic layers */}
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute inset-0 opacity-20"
        animate={{
          x: [0, 2, -2, 0],
          y: [0, -1, 1, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 2 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.2,
        }}
        style={{
          filter: `hue-rotate(${i * 60}deg)`,
        }}
      >
        {children}
      </motion.div>
    ))}
  </motion.div>
);

// Mouse follower effect
const MouseFollower: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 10 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 10 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 w-8 h-8 rounded-full"
      style={{
        x: springX,
        y: springY,
        background:
          "radial-gradient(circle, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.2), transparent)",
        filter: "blur(10px)",
        mixBlendMode: "screen",
      }}
    />
  );
};

// Advanced animated background with geometric shapes
const AdvancedBackground: React.FC = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {/* Gradient layers */}
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          "radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 60% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)",
          "radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
        ],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear",
      }}
    />

    {/* Floating geometric shapes */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute opacity-10"
        style={{
          width: 100 + i * 20,
          height: 100 + i * 20,
          background: `conic-gradient(from ${
            i * 45
          }deg, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))`,
          borderRadius: i % 2 === 0 ? "50%" : "20%",
        }}
        animate={{
          x: [
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
          ],
          y: [
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
          ],
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20 + i * 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}

    {/* Scan lines effect */}
    <motion.div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
      }}
      animate={{
        y: [0, -4],
      }}
      transition={{
        duration: 0.1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [magicCount, setMagicCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const premiumParticles = [
    { Icon: Crown, color: "text-yellow-400", size: "w-6 h-6" },
    { Icon: Diamond, color: "text-cyan-400", size: "w-5 h-5" },
    { Icon: Gem, color: "text-purple-400", size: "w-5 h-5" },
    { Icon: Sparkles, color: "text-pink-400", size: "w-4 h-4" },
    { Icon: Star, color: "text-blue-400", size: "w-4 h-4" },
    { Icon: Zap, color: "text-green-400", size: "w-4 h-4" },
  ];

  const quickLinks = [
    {
      name: "Servers",
      path: "/servers",
      icon: Server,
      description: "Quản lý server",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
    },
    {
      name: "SSH Keys",
      path: "/ssh-keys",
      icon: Key,
      description: "Quản lý SSH keys",
      gradient: "from-purple-500 via-pink-500 to-rose-500",
    },
    {
      name: "Workloads",
      path: "/workloads",
      icon: Shield,
      description: "Quản lý workloads",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
    },
    {
      name: "Security Standards",
      path: "/security-standards",
      icon: Lock,
      description: "Tiêu chuẩn bảo mật",
      gradient: "from-orange-500 via-red-500 to-pink-500",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMagicCount((prev) => prev + 1);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleMagicClick = () => {
    setMagicCount((prev) => prev + 10);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)",
      }}
    >
      <AdvancedBackground />
      <MouseFollower />

      {/* Enhanced floating particles */}
      <AnimatePresence>
        {[...Array(20)].map((_, i) => (
          <FloatingParticle
            key={`${magicCount}-${i}`}
            delay={i * 0.1}
            duration={3 + Math.random() * 3}
            Icon={premiumParticles[i % premiumParticles.length].Icon}
            color={premiumParticles[i % premiumParticles.length].color}
            size={premiumParticles[i % premiumParticles.length].size}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Main 404 Section with 3D effects */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.3, rotateX: -90 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{
            duration: 1.2,
            type: "spring",
            bounce: 0.3,
            staggerChildren: 0.2,
          }}
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="relative inline-block mb-8"
            whileHover={{
              scale: 1.1,
              rotateY: 5,
              rotateX: 5,
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleMagicClick}
            style={{
              cursor: "pointer",
              transformStyle: "preserve-3d",
            }}
          >
            <HolographicText className="text-8xl md:text-[14rem] font-black bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              404
            </HolographicText>

            {/* 3D depth layers */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 text-8xl md:text-[14rem] font-black opacity-10"
                style={{
                  transform: `translateZ(-${(i + 1) * 10}px)`,
                  background: `linear-gradient(45deg, hsl(${
                    280 + i * 20
                  }, 70%, 60%), hsl(${200 + i * 20}, 70%, 60%))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                animate={{
                  opacity: isHovered ? 0.2 : 0.05,
                }}
              >
                404
              </motion.div>
            ))}

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
              animate={{
                x: ["-100%", "100%"],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent, white, transparent)",
              }}
            />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50, rotateX: -30 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            Trang không tồn tại
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Bạn đã lạc vào không gian số! Đừng lo lắng, chúng tôi sẽ dẫn đường
            cho bạn về nhà.
          </motion.p>

          {/* Premium action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/")}
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 border border-white/20"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
                <Home className="mr-3 h-6 w-6" />
                Về trang chủ
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="relative overflow-hidden border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/20 hover:text-white font-bold px-10 py-4 rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 backdrop-blur-sm bg-white/5"
              >
                <ArrowLeft className="mr-3 h-6 w-6" />
                Quay lại
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced quick links section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <Card className="relative overflow-hidden backdrop-blur-xl bg-black/30 border border-white/10 shadow-2xl rounded-3xl">
            {/* Corner accents */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-20 border-2 border-purple-400/30"
                style={{
                  top: i < 2 ? 0 : "auto",
                  bottom: i >= 2 ? 0 : "auto",
                  left: i % 2 === 0 ? 0 : "auto",
                  right: i % 2 === 1 ? 0 : "auto",
                  borderTopLeftRadius: i === 0 ? "1.5rem" : 0,
                  borderTopRightRadius: i === 1 ? "1.5rem" : 0,
                  borderBottomLeftRadius: i === 2 ? "1.5rem" : 0,
                  borderBottomRightRadius: i === 3 ? "1.5rem" : 0,
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}

            <CardContent className="p-10">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", bounce: 0.5 }}
                >
                  <Badge
                    variant="secondary"
                    className="mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-400/30 px-6 py-2 text-lg rounded-full backdrop-blur-sm"
                  >
                    <Search className="mr-3 h-5 w-5" />
                    Có thể bạn đang tìm kiếm
                  </Badge>
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Truy cập nhanh
                </h2>
                <p className="text-gray-300 text-lg">
                  Chọn một trong những trang phổ biến bên dưới
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 30, rotateY: -30 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{
                      delay: 1.3 + index * 0.1,
                      duration: 0.8,
                      type: "spring",
                      bounce: 0.3,
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                      rotateY: 5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Card
                      className="cursor-pointer backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 group overflow-hidden relative rounded-2xl h-full"
                      onClick={() => navigate(link.path)}
                    >
                      {/* Gradient overlay */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                        whileHover={{
                          opacity: 0.2,
                        }}
                      />

                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      />

                      <CardContent className="p-8 text-center relative z-10 h-full flex flex-col justify-center">
                        <motion.div
                          className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
                          whileHover={{
                            rotateY: 180,
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          <link.icon className="h-8 w-8 text-white" />
                        </motion.div>

                        <h3 className="font-bold text-xl text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-500">
                          {link.name}
                        </h3>

                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          {link.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced easter egg */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.p
            className="text-lg text-gray-400 cursor-pointer hover:text-purple-400 transition-colors duration-300 font-medium"
            whileHover={{
              scale: 1.1,
              textShadow: "0 0 20px rgba(147, 51, 234, 0.5)",
            }}
            onClick={handleMagicClick}
          >
            ✨ Click vào số 404 để tạo thêm hiệu ứng ma thuật! ✨
          </motion.p>

          <motion.div
            className="mt-4 text-sm text-gray-500"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Magic Count: {magicCount}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
