import { useState, useRef, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rotation: number;
  size: number;
}

const TreeClicker = () => {
  const [count, setCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);

  const handleClick = () => {
    setCount(count + 1);
    
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
      <div className="text-4xl font-bold mb-8 text-green-700">{count} Tree</div>
      
      <button 
        ref={buttonRef} 
        className="w-40 h-40 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-100 active:scale-95 hover:bg-green-600 focus:outline-none cursor-pointer"
        onClick={handleClick}
      >
        <TreeIcon className="w-24 h-24 text-white" />
      </button>

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
          <TreeIcon 
            className="text-green-500 opacity-70"
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

export default TreeClicker;