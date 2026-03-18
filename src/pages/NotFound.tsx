
import { useState, useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getEyeStyle = (eyeRef: RefObject<HTMLDivElement | null>) => {
    if (!eyeRef.current) return {};

    const rect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const angle = Math.atan2(mousePos.y - eyeCenterY, mousePos.x - eyeCenterX);
    const distance = Math.min(
      Math.hypot(mousePos.x - eyeCenterX, mousePos.y - eyeCenterY) / 10,
      15 // Max offset
    );

    const translateX = Math.cos(angle) * distance;
    const translateY = Math.sin(angle) * distance;

    return {
      transform: `translate(${translateX}px, ${translateY}px)`,
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-background px-6">

      {/* Interactive Eyes Section */}
      <div className="flex gap-8 mb-12 animate-float">
        {/* Left Eye */}
        <div className="relative w-32 h-32 bg-white rounded-full border-4 border-gray-900 shadow-inner flex items-center justify-center overflow-hidden">
          <div
            ref={eyeLeftRef}
            className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center transition-transform duration-75 ease-out"
            style={getEyeStyle(eyeLeftRef)}
          >
            <div className="w-4 h-4 bg-white rounded-full absolute top-2 right-2 opacity-80"></div>
          </div>
        </div>

        {/* Right Eye */}
        <div className="relative w-32 h-32 bg-white rounded-full border-4 border-gray-900 shadow-inner flex items-center justify-center overflow-hidden">
          <div
            ref={eyeRightRef}
            className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center transition-transform duration-75 ease-out"
            style={getEyeStyle(eyeRightRef)}
          >
            <div className="w-4 h-4 bg-white rounded-full absolute top-2 right-2 opacity-80"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center max-w-xl z-10">
        <h1 className="text-4xl font-bold text-gray-200 mb-6">
          Whoops! You're being watched...
        </h1>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          It looks like the page you are looking for has vanished into the void.
          The eyes are looking for it too, but they can't find anything but you!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="px-12 h-14 text-lg shadow-[0_0_20px_rgba(2,132,199,0.3)] cursor-pointer transition-all">
              Back to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
