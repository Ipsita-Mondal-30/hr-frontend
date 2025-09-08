"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useCallback, useMemo } from "react";

export const ImagesSlider = ({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = "up",
}: {
  images: string[];
  children: React.ReactNode;
  overlay?: React.ReactNode;
  overlayClassName?: string;
  className?: string;
  autoplay?: boolean;
  direction?: "up" | "down";
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 === images.length ? 0 : prevIndex + 1));
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const loadImages = useCallback(() => {
    const loadPromises = images.map(
      (image) =>
        new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.src = image;
          img.onload = () => resolve(image);
          img.onerror = () => reject(new Error(`Failed to load image: ${image}`));
        })
    );
    Promise.all(loadPromises)
      .then((loaded) => {
        setLoadedImages(loaded);
      })
      .catch((err) => {
        console.error("Failed to load images", err);
        // Fallback: still set what may have loaded until failure
        setLoadedImages((prev) => (prev.length ? prev : images));
      });
  }, [images]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    let interval: number | undefined;
    if (autoplay) {
      interval = window.setInterval(() => {
        handleNext();
      }, 5000);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [autoplay, handleNext, handlePrevious]);

  const slideVariants = useMemo(
    () => ({
      initial: {
        scale: 0,
        opacity: 0,
        rotateX: 45,
      },
      visible: {
        scale: 1,
        rotateX: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
        },
      },
      upExit: {
        opacity: 1,
        y: "-150%",
        transition: {
          duration: 1,
        },
      },
      downExit: {
        opacity: 1,
        y: "150%",
        transition: {
          duration: 1,
        },
      },
    }),
    []
  );

  const areImagesLoaded = loadedImages.length > 0;

  return (
    <div
      className={cn("overflow-hidden h-full w-full relative flex items-center justify-center", className)}
      style={{ perspective: "1000px" }}
    >
      {areImagesLoaded && children}
      {areImagesLoaded && overlay && (
        <div className={cn("absolute inset-0 bg-black/60 z-40", overlayClassName)} />
      )}
      {areImagesLoaded && (
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={loadedImages[currentIndex]}
            initial="initial"
            animate="visible"
            exit={direction === "up" ? "upExit" : "downExit"}
            variants={slideVariants}
            className="image h-full w-full absolute inset-0 object-cover object-center"
            alt=""
          />
        </AnimatePresence>
      )}
    </div>
  );
};
