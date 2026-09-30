"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const heroFilm = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (reducedMotion.matches) videoRef.current?.pause();
      else void videoRef.current?.play().catch(() => setPaused(true));
    };
    update();
    // Cached media may finish loading before React attaches its event handlers.
    const frame = requestAnimationFrame(() => {
      if (videoRef.current && videoRef.current.readyState >= 2) setReady(true);
    });
    reducedMotion.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <>
      <Image
        className="devmatch-hero-poster"
        src="/images/hero-poster.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        className="devmatch-hero-film"
        data-ready={ready && !failed}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlay={() => setPaused(false)}
        onPlaying={() => setReady(true)}
        onPause={() => setPaused(true)}
        onError={() => setFailed(true)}
        onLoadedData={() => {
          setReady(true);
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) videoRef.current?.pause();
        }}
      >
        <source src={heroFilm} type="video/mp4" onError={() => setFailed(true)} />
      </video>
      {ready && !failed && (
        <button
          className="devmatch-glass film-control"
          type="button"
          aria-label={paused ? "Play background video" : "Pause background video"}
          onClick={() => {
            if (paused) void videoRef.current?.play().catch(() => setFailed(true));
            else videoRef.current?.pause();
          }}
        >
          {paused ? "Play film" : "Pause film"}
        </button>
      )}
    </>
  );
}
