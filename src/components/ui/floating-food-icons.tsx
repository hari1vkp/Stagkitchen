"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface FloatingIcon {
  id: number;
  src: string;
  alt: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const foodIcons = [
  { src: '/food-icons/food.svg', alt: 'Food icon 1' },
  { src: '/food-icons/food (1).svg', alt: 'Food icon 2' },
  { src: '/food-icons/non-veg-food.svg', alt: 'Non-veg food icon' },
  { src: '/food-icons/Daco_420218.png', alt: 'Food decoration' },
  { src: '/food-icons/—Pngtree—fresh food icon with bread_11083821.png', alt: 'Fresh food with bread' },
];

export default function FloatingFoodIcons() {
  const [icons, setIcons] = useState<FloatingIcon[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const generateIcons = () => {
      const newIcons: FloatingIcon[] = [
        {
          id: 1,
          src: '/food-icons/food.svg',
          alt: 'Food icon 1',
          x: 10,
          y: 20,
          size: 80,
          duration: 20,
          delay: 0,
        },
        {
          id: 2,
          src: '/food-icons/food (1).svg',
          alt: 'Food icon 2',
          x: 80,
          y: 30,
          size: 70,
          duration: 25,
          delay: 2,
        },
        {
          id: 3,
          src: '/food-icons/non-veg-food.svg',
          alt: 'Non-veg food',
          x: 20,
          y: 70,
          size: 90,
          duration: 18,
          delay: 4,
        },
        {
          id: 4,
          src: '/food-icons/Daco_420218.png',
          alt: 'Food decoration',
          x: 70,
          y: 80,
          size: 60,
          duration: 22,
          delay: 1,
        },
        {
          id: 5,
          src: '/food-icons/—Pngtree—fresh food icon with bread_11083821.png',
          alt: 'Fresh food',
          x: 50,
          y: 50,
          size: 85,
          duration: 24,
          delay: 3,
        },
      ];
      
      setIcons(newIcons);
      console.log('Generated floating icons:', newIcons.length);
    };

    generateIcons();
    
    // Regenerate icons every 30 seconds for variety
    const interval = setInterval(generateIcons, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="absolute animate-float opacity-60 dark:opacity-40"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            animationDuration: `${icon.duration}s`,
            animationDelay: `${icon.delay}s`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
          }}
        >
          <Image
            src={icon.src}
            alt={icon.alt}
            width={icon.size}
            height={icon.size}
            className="w-full h-full object-contain"
            priority={false}
            onError={(e) => {
              // Hide icon if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
}