"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play, X } from "lucide-react";

const videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const ease = [0.16, 1, 0.3, 1] as const;
const navigation = {
  "Our story": "Prisma brings visual artists, filmmakers, and storytellers together. Different places. Different perspectives. A shared passion for making something meaningful.",
  Collective: "A worldwide network bound not by place, status, or labels, but by passion and a hunger to unlock creative potential.",
  Workshops: "Explore color grading, visual effects, and narrative design. Our workshop program is still taking shape.",
  Programs: "Space to experiment, collaborate, and develop your creative voice. Program details are coming soon.",
  Inquiries: "Interested in being part of the collective? The lab is a place to meet other makers and explore what comes next.",
};
type Panel = keyof typeof navigation;

function WordsPullUp({ text, showAsterisk = false }: { text: string; showAsterisk?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <h1 ref={ref} className="prisma-wordmark" aria-label={text}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="prisma-word"
          aria-hidden="true"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : undefined}
          transition={{ duration: reduced ? 0 : .9, delay: reduced ? 0 : index * .08, ease }}
        >
          {word}
          {showAsterisk && index === words.length - 1 && <sup className="prisma-asterisk">*</sup>}
          {index < words.length - 1 ? " " : null}
        </motion.span>
      ))}
    </h1>
  );
}

export function PrismaHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [panel, setPanel] = useState<Panel>("Our story");

  useEffect(() => {
    if (reduced) videoRef.current?.pause();
    else void videoRef.current?.play().catch(() => setPaused(true));
  }, [reduced]);

  function closePanel() {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  return (
    <section className="prisma-hero-shell" aria-label="Prisma creative collective">
      <div className="prisma-hero-frame">
        <video
          ref={videoRef}
          className="prisma-film"
          autoPlay loop muted playsInline preload="auto" aria-hidden="true"
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onLoadedData={() => { if (reduced) videoRef.current?.pause(); }}
          onError={() => setFailed(true)}
        >
          <source src={videoUrl} type="video/mp4" onError={() => setFailed(true)} />
        </video>
        <div className="prisma-noise-overlay" aria-hidden="true" />
        <div className="prisma-film-shade" aria-hidden="true" />

        <header className="prisma-header">
          <nav aria-label="Prisma navigation" className="prisma-nav">
            {Object.keys(navigation).map((item) => item === "Our story" || item === "Programs" ? (
              <a key={item} href={item === "Our story" ? "#prisma-about" : "#prisma-features"}>{item}</a>
            ) : (
              <button key={item} type="button" onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setPanel(item as Panel);
                dialogRef.current?.showModal();
              }}>{item}</button>
            ))}
          </nav>
        </header>

        <div className="prisma-hero-content">
          <div className="prisma-heading-column"><WordsPullUp text="Prisma" showAsterisk /></div>
          <div className="prisma-intro-column">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8, delay: reduced ? 0 : .5, ease }}>
              Prisma is a worldwide network of visual artists, filmmakers and storytellers bound not by place, status or labels but by passion and hunger to unlock potential through our unique perspectives.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8, delay: reduced ? 0 : .7, ease }}>
              <Link href="/signup" className="prisma-join group">
                <span>Join the lab</span>
                <span className="prisma-join-icon"><ArrowRight size={21} strokeWidth={1.7} aria-hidden="true" /></span>
              </Link>
            </motion.div>
          </div>
        </div>

        {!failed && <button type="button" className="prisma-film-control" aria-label={paused ? "Play background video" : "Pause background video"} onClick={() => {
          if (paused) void videoRef.current?.play().catch(() => setFailed(true));
          else videoRef.current?.pause();
        }}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>}
        {failed && <span role="status" className="prisma-film-status">The film is unavailable right now.</span>}
      </div>
      <dialog ref={dialogRef} className="prisma-info" aria-labelledby="prisma-panel-title" onCancel={() => triggerRef.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
        <div className="prisma-info-inner">
          <button type="button" className="prisma-close" aria-label="Close" onClick={closePanel}><X size={20} /></button>
          <span className="prisma-info-label">PRISMA COLLECTIVE</span>
          <h2 id="prisma-panel-title">{panel}</h2>
          <p>{navigation[panel]}</p>
          <Link href="/signup" className="prisma-join"><span>Join the lab</span><span className="prisma-join-icon"><ArrowRight size={21} aria-hidden="true" /></span></Link>
        </div>
      </dialog>
    </section>
  );
}
