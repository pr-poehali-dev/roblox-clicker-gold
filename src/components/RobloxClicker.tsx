import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rotation: number;
  size: number;
}

const RobloxClicker = () => {
  const [count, setCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);

  const handleClick = () => {
    setCount(count + 1);
    
    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Создаем 3 новые частицы при каждом клике
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        
        newParticles.push({
          id: particleIdRef.current++,
          x: centerX,
          y: centerY,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          rotation: Math.random() * 360,
          size: 20 + Math.random() * 15,
        });
      }
      
      setParticles([...particles, ...newParticles]);
    }
  };

  useEffect(() => {
    if (particles.length === 0) return;

    const animationId = requestAnimationFrame(() => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.speedX,
            y: particle.y + particle.speedY,
            speedY: particle.speedY + 0.1, // гравитация
            rotation: particle.rotation + 2,
          }))
          // Удалять частицы, которые вышли за границы экрана
          .filter(particle => 
            particle.y < window.innerHeight + 100 && 
            particle.x > -100 && 
            particle.x < window.innerWidth + 100
          )
      );
    });

    return () => cancelAnimationFrame(animationId);
  }, [particles]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-white">
      <div className="text-4xl font-bold mb-8 text-gold">{count} Robux</div>
      
      <div 
        ref={logoRef} 
        className="cursor-pointer transition-transform duration-100 active:scale-95"
        onClick={handleClick}
      >
        <img 
          src="/robux-gold.svg" 
          alt="Robux Logo" 
          className="w-40 h-40"
        />
      </div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `rotate(${particle.rotation}deg) translate(-50%, -50%)`,
          }}
        >
          <img 
            src="/robux-gold.svg" 
            alt="Robux Particle"
            className="w-6 h-6 opacity-70"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default RobloxClicker;