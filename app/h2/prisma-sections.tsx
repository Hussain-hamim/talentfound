"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Check, Pause, Play, X } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;
const biography = "Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals.";
const assetRoot = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";
const features = [
  {
    number: "01", title: "Project Storyboard.",
    image: "hf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png",
    items: ["Map every scene and sequence.", "Keep references in one place.", "Shape your story with your team.", "Move from first idea to final frame."],
    detail: "Give every idea a place in the story. Gather visual references, organize scenes, and share a clear creative direction with your collaborators before production begins.",
  },
  {
    number: "02", title: "Smart Critiques.",
    image: "hf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png",
    items: ["AI analysis with a creative lens.", "Actionable notes for your next cut.", "Connect the tools you already use."],
    detail: "Look at your work from a fresh perspective. Explore feedback on pacing, color, and composition, collect creative notes, and bring them into your existing workflow. Your creative judgment always comes first.",
  },
  {
    number: "03", title: "Immersion Capsule.",
    image: "hf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png",
    items: ["Silence distracting notifications.", "Set the mood with ambient soundscapes.", "Sync focus time with your schedule."],
    detail: "Create a little space for deep work. Pair quiet notifications with an ambient soundscape and a dedicated block in your schedule, so your attention stays with the thing you are making.",
  },
];

type Segment = { text: string; className?: string };
function WordsPullUpMultiStyle({ segments, className, id }: { segments: Segment[]; className?: string; id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const visible = useInView(ref, { once: true, amount: .25 });
  const reduced = useReducedMotion();
  const words = segments.flatMap((segment) => segment.text.split(" ").map((word) => ({ word, className: segment.className })));
  return <h2 ref={ref} id={id} className={className} aria-label={segments.map((segment) => segment.text).join(" ")}>
    {words.map(({ word, className: wordStyle }, index) => <motion.span
      key={`${word}-${index}`} aria-hidden="true" className={`prisma-reveal-word ${wordStyle ?? ""}`}
      initial={{ opacity: 0, y: 20 }} animate={visible ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0 : .65, delay: reduced ? 0 : index * .08, ease }}
    >{word}{index < words.length - 1 ? "\u00a0" : ""}</motion.span>)}
  </h2>;
}

function AnimatedLetter({ letter, index, total, progress }: { letter: string; index: number; total: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [Math.max(0, index / total - .1), Math.min(1, index / total + .05)], [.2, 1]);
  return <motion.span style={{ opacity }}>{letter}</motion.span>;
}

function ScrollBiography() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const words = Array.from(biography.matchAll(/\S+/g), (match) => ({ word: match[0], start: match.index }));
  // Keep words together visually and expose a single uninterrupted paragraph to assistive technology.
  return <p ref={ref} className="prisma-biography" aria-label={biography}>
    {reduced ? biography : <span aria-hidden="true">{words.map(({ word, start }, wordIndex) => {
      return <span key={wordIndex}><span className="prisma-biography-word">{Array.from(word).map((letter, index) => <AnimatedLetter key={index} letter={letter} index={start + index} total={biography.length} progress={scrollYProgress} />)}</span>{" "}</span>;
    })}</span>}
  </p>;
}

function CreativeCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced) videoRef.current?.pause();
    else void videoRef.current?.play().catch(() => setPaused(true));
  }, [reduced]);
  return <>
    <video ref={videoRef} autoPlay loop muted playsInline preload="metadata" className="prisma-canvas-film" aria-hidden="true"
      onPause={() => setPaused(true)} onPlay={() => setPaused(false)}
      onLoadedData={() => { if (reduced) videoRef.current?.pause(); }}>
      <source src={`${assetRoot}hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4`} type="video/mp4" />
    </video>
    <div className="prisma-canvas-shade" aria-hidden="true" />
    <button className="prisma-canvas-control" aria-label={paused ? "Play creative canvas video" : "Pause creative canvas video"} onClick={() => {
      if (paused) void videoRef.current?.play().catch(() => setPaused(true));
      else videoRef.current?.pause();
    }}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>
    <h3>Your creative canvas.</h3>
  </>;
}

export function PrismaSections() {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridVisible = useInView(gridRef, { once: true, margin: "-100px" });
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState(features[0]);
  const cardMotion = (index: number) => ({
    initial: { opacity: 0, scale: .95 },
    animate: gridVisible ? { opacity: 1, scale: 1 } : undefined,
    transition: { duration: reduced ? 0 : .7, delay: reduced ? 0 : index * .15, ease: [0.22, 1, 0.36, 1] as const },
  });
  function closeDetails() { dialogRef.current?.close(); triggerRef.current?.focus(); }

  return <>
    <section id="prisma-about" className="prisma-about" aria-labelledby="prisma-about-title">
      <div className="prisma-about-card">
        <span className="prisma-section-label">Visual arts</span>
        <WordsPullUpMultiStyle id="prisma-about-title" className="prisma-about-heading" segments={[
          { text: "I am Marcus Chen," },
          { text: "a self-taught director.", className: "prisma-serif-accent" },
          { text: "I have skills in color grading, visual effects, and narrative design." },
        ]} />
        <ScrollBiography />
      </div>
    </section>

    <section id="prisma-features" className="prisma-features" aria-labelledby="prisma-features-title">
      <div className="prisma-bg-noise" aria-hidden="true" />
      <div className="prisma-features-inner">
        <div className="prisma-features-heading">
          <WordsPullUpMultiStyle id="prisma-features-title" segments={[{ text: "Studio-grade workflows for visionary creators." }]} />
          <WordsPullUpMultiStyle segments={[{ text: "Built for pure vision. Powered by art.", className: "prisma-heading-muted" }]} />
        </div>
        <div ref={gridRef} className="prisma-feature-grid">
          <motion.article className="prisma-feature-card prisma-canvas-card" {...cardMotion(0)}><CreativeCanvas /></motion.article>
          {features.map((feature, index) => <motion.article key={feature.number} className="prisma-feature-card" {...cardMotion(index + 1)}>
            <Image unoptimized width={48} height={48} className="prisma-feature-image" alt="" src={`https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(assetRoot + feature.image)}&w=1280&q=85`}
              onError={(event) => { const fallback = assetRoot + feature.image; if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback; }} />
            <div className="prisma-feature-title"><h3>{feature.title}</h3><span>{feature.number}</span></div>
            <ul>{feature.items.map((item) => <li key={item}><Check size={15} strokeWidth={1.6} aria-hidden="true" /><span>{item}</span></li>)}</ul>
            <button className="prisma-learn-more" aria-label={`Learn more about ${feature.title.replace(/\.$/, "")}`} onClick={(event) => {
              triggerRef.current = event.currentTarget; setSelected(feature); dialogRef.current?.showModal();
            }}>Learn more <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" /></button>
          </motion.article>)}
        </div>
      </div>
    </section>
    <dialog ref={dialogRef} className="prisma-info" aria-labelledby="prisma-feature-dialog-title" onCancel={() => triggerRef.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
      <div className="prisma-info-inner">
        <button type="button" className="prisma-close" aria-label="Close feature details" onClick={closeDetails}><X size={20} /></button>
        <span className="prisma-info-label">PRISMA / {selected.number}</span>
        <h2 id="prisma-feature-dialog-title">{selected.title}</h2>
        <p>{selected.detail}</p>
      </div>
    </dialog>
  </>;
}
