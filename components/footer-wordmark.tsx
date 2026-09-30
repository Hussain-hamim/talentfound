"use client";

import { useEffect, useRef } from "react";

const WIDTH = 1200;
const HEIGHT = 160;
const LABEL = "TALENTFOUND";

export function FooterWordmark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let disposed = false;
    let visible = false;
    let frame = 0;
    let color = "#ff3317";
    let dots: { x: number; y: number; phase: number; speed: number }[] = [];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function paint(time: number) {
      if (!context) return;
      context.clearRect(0, 0, WIDTH, HEIGHT);
      context.fillStyle = color;
      for (const dot of dots) {
        const wave = 0.6 * Math.sin(time * dot.speed + dot.phase)
          + 0.4 * Math.sin(time * dot.speed * 0.57 + dot.phase * 2.3);
        context.globalAlpha = motion.matches ? 0.65 : 0.43 + wave * 0.34;
        context.beginPath();
        context.arc(dot.x, dot.y, 1.8, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    }

    function animate(time: number) {
      paint(time / 1000);
      frame = requestAnimationFrame(animate);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      if (disposed || !dots.length) return;
      paint(performance.now() / 1000);
      if (visible && !document.hidden && !motion.matches) {
        frame = requestAnimationFrame(animate);
      }
    }

    function resize() {
      if (!canvas || !context || disposed) return;
      const width = canvas.getBoundingClientRect().width;
      if (!width) return;
      const scale = (width / WIDTH) * Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(WIDTH * scale);
      canvas.height = Math.round(HEIGHT * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      syncAnimation();
    }

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    motion.addEventListener("change", syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);

    void document.fonts.ready.then(() => {
      if (disposed) return;
      const mask = document.createElement("canvas");
      mask.width = WIDTH;
      mask.height = HEIGHT;
      const maskContext = mask.getContext("2d", { willReadFrequently: true });
      if (!maskContext) return;
      const styles = getComputedStyle(canvas);
      color = styles.color;
      maskContext.font = `600 150px ${styles.fontFamily}`;
      const textWidth = maskContext.measureText(LABEL).width;
      maskContext.translate(8, 0);
      maskContext.scale(1184 / textWidth, 1);
      maskContext.fillText(LABEL, 0, 132);
      const pixels = maskContext.getImageData(0, 0, WIDTH, HEIGHT).data;
      dots = [];
      for (let y = 4; y < HEIGHT; y += 8) {
        for (let x = 4; x < WIDTH; x += 8) {
          if (pixels[(y * WIDTH + x) * 4 + 3] < 128) continue;
          dots.push({ x, y, phase: Math.random() * Math.PI * 2, speed: 1 + Math.random() * 3 });
        }
      }
      resize();
      canvas.dataset.ready = "true";
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motion.removeEventListener("change", syncAnimation);
      document.removeEventListener("visibilitychange", syncAnimation);
    };
  }, []);

  return (
    <div className="oversized-wordmark" aria-hidden="true">
      <canvas ref={canvasRef} />
      <svg viewBox="0 0 1200 160" focusable="false">
        <defs>
          <pattern id="footer-letter-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.8" fill="currentColor" />
          </pattern>
        </defs>
        <text x="8" y="132" textLength="1184" lengthAdjust="spacingAndGlyphs" fill="url(#footer-letter-dots)">
          {LABEL}
        </text>
      </svg>
    </div>
  );
}
