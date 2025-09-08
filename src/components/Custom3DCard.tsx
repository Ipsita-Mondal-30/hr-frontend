"use client";
import React, { useState, useRef, ReactNode } from "react";

interface CardContainerProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardItemProps {
  children: ReactNode;
  className?: string;
  translateZ?: string | number;
  as?: React.ElementType;
  href?: string;
  target?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = "",
  containerClassName = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ ,setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
    if (containerRef.current) {
      containerRef.current.style.transition = "";
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.transition = "transform 0.5s ease-out";
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }
    setIsMouseEntered(false);
  };

  return (
    <div
      className={`py-10 flex items-center justify-center ${containerClassName}`}
      style={{
        perspective: "1000px",
      }}
    >
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center justify-center relative transition-all duration-200 ease-linear ${className}`}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`h-auto w-auto [transform-style:preserve-3d] ${className}`}
    >
      {children}
    </div>
  );
};

export const CardItem: React.FC<CardItemProps> = ({
  children,
  className = "",
  translateZ = "0",
  as: Component = "div",
  ...props
}) => {
  const translateValue = typeof translateZ === 'number' ? `${translateZ}px` : translateZ.includes('px') ? translateZ : `${translateZ}px`;
  
  return (
    <Component
      className={className}
      style={{
        transform: `translateZ(${translateValue})`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};