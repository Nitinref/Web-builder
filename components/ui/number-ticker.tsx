"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const NumberTicker = ({
  value,
  className,
  duration = 2,
  delay = 0,
}: {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
    //   @ts-ignore
      { threshold: 0.1, margin: "-100px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp + delay * 1000;
      }

      const progress = Math.min(
        (timestamp - startTime) / (duration * 1000),
        1
      );

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration, delay, isInView]);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {count.toLocaleString()}
    </span>
  );
};