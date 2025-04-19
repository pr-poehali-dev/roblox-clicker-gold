import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Particle {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rotation: number;
  size: number;
  type: "tree" | "dollar";
}

const TreeClicker = () => {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Создание аудио элемента для звука монет
  useEffect(() => {
    const audio = new Audio();
    audio.src = "https://cdn.freesound.org/previews/275/275154_4486188-lq.mp3"; // URL звука монет
    audio.preload = "auto";
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Генерация долларов каждые 2 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        
        setParticles(prev => [...prev, {
          id: particleIdRef.current++,
          x: centerX,
          y: centerY,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          rotation: Math.random() * 360,
          size: 15 + Math.random() * 10,
          type: "dollar"
        }]);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Обработчик клика по дереву
  const handleClick = () => {
    // Увеличиваем счетчик на 1 с учетом множителя
    setCount(prev => prev + 1 * multiplier);
    
    // Воспроизводим звук монет
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    createParticles();
  };

  // Функция создания частиц
  const createParticles = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
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
          type: "tree"
        });
      }
      
      setParticles(prev => [...prev, ...newParticles]);
    }
  };

  // Улучшение дерева
  const upgradeTree = () => {
    if (count >= 100) {
      setCount(prev => prev - 100);
      setMultiplier(prev => prev * 2);
    }
  };

  // Анимация частиц
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
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-white py-10">
      {/* Счетчик деревьев */}
      <div className="text-4xl font-bold mb-8 text-green-700">{count} Tree</div>
      
      {/* Дерево */}
      <div className="mb-12">
        <div className="text-center text-lg text-green-700 mb-2">Дерево (+{multiplier} Tree)</div>
        <button 
          ref={buttonRef} 
          className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-100 active:scale-95 hover:bg-green-600 focus:outline-none cursor-pointer"
          onClick={handleClick}
        >
          <TreeIcon className="w-20 h-20 text-white" />
        </button>
        
        <div className="mt-4 text-sm text-gray-600">
          Текущий множитель: x{multiplier}
        </div>
      </div>
      
      {/* Улучшение дерева (вместо нижнего дерева) */}
      <div className="mt-8 w-64 p-4 border rounded-md bg-green-50 shadow-md">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Улучшить дерево</span>
          <span className="text-green-700">100 🌳</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">Удвоить количество получаемых деревьев за клик</p>
        <Button 
          onClick={upgradeTree} 
          disabled={count < 100}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
        >
          Купить x{multiplier * 2}
        </Button>
      </div>
      
      {/* Частицы */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `rotate(${particle.rotation}deg) translate(-50%, -50%)`,
            zIndex: 50,
          }}
        >
          {particle.type === "tree" ? (
            <TreeIcon 
              className="text-green-500 opacity-70"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
            />
          ) : (
            <DollarIcon 
              className="text-green-600 opacity-80"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const TreeIcon = ({ className = "", ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M12 22v-7" />
      <path d="M9 9h6" />
      <path d="M12 3v2c0 1.1.9 2 2 2h1a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-1a2 2 0 0 0-2 2v1"
        fill="currentColor" stroke="white" />
      <path d="M12 3a6 6 0 0 0-6 6c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2 6 6 0 0 0-6-6z"
        fill="currentColor" stroke="white" />
      <path d="M12 15a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H7a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2 2 2 0 0 1-2-2h-2"
        fill="currentColor" stroke="white" />
    </svg>
  );
};

const DollarIcon = ({ className = "", ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="0.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="#e8f5e9" stroke="#4caf50" />
      <path d="M12 6v12M15 9H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8" fill="none" stroke="#2e7d32" strokeWidth="1.5" />
    </svg>
  );
};

export default TreeClicker;