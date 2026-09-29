import { useEffect, useRef, useState } from "react";
import { Menu, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const displayFont = { fontFamily: "'Instrument Serif', serif" };
const pages = {
  Studio: { title: "Space for inspired work.", description: "We’re designing thoughtful digital tools that help you slow down, find clarity, and give your ideas room to grow." },
  About: { title: "For the quietly ambitious.", description: "Velorah is built around a simple belief: your best work begins with a little space. A place for deep thinkers, bold creators, and quiet rebels." },
  Journal: { title: "Notes from the quiet.", description: "Reflections on focus, creativity, and making things with intention. Our first stories are still taking shape. Come back soon." },
  "Reach Us": { title: "Let’s start with an idea.", description: "Our contact channel is coming soon. For now, begin your journey with a small intention for what you want to create." },
};
type Panel = keyof typeof pages | "journey" | "menu" | null;

export function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [paused, setPaused] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [intention, setIntention] = useState("");
  const [started, setStarted] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      if (preference.matches) videoRef.current?.pause();
      else void videoRef.current?.play().catch(() => setPaused(true));
    };
    syncMotion();
    preference.addEventListener("change", syncMotion);
    return () => preference.removeEventListener("change", syncMotion);
  }, []);

  const openPanel = (next: Exclude<Panel, null>) => {
    if (panel === null) returnFocusRef.current = document.activeElement as HTMLElement;
    setPanel(next);
  };

  const begin = () => {
    try { setIntention(localStorage.getItem("velorah-intention") ?? ""); } catch { /* Storage is optional. */ }
    setStarted(false);
    setSaveError(false);
    openPanel("journey");
  };

  return (
    <div className="cinema relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <video ref={videoRef} className="absolute inset-0 z-0 h-full w-full object-cover" autoPlay loop muted playsInline preload="auto" aria-hidden="true" onLoadedData={() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) videoRef.current?.pause(); }} onPause={() => setPaused(true)} onPlay={() => setPaused(false)} onError={() => setVideoFailed(true)}>
        <source src={VIDEO} type="video/mp4" onError={() => setVideoFailed(true)} />
      </video>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <a href="#" aria-label="Velorah home" className="wordmark text-3xl tracking-tight" style={displayFont} onClick={() => setPanel(null)}>Velorah<sup className="text-xs">®</sup></a>
        <nav aria-label="Main navigation" className="hidden items-center gap-9 md:flex">
          <a href="#main-content" aria-current="page" className="text-sm text-foreground transition-colors">Home</a>
          {Object.keys(pages).map((name) => <button key={name} type="button" onClick={() => openPanel(name as keyof typeof pages)} className="nav-link text-sm text-muted-foreground transition-colors hover:text-foreground">{name}</button>)}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="glass" className="header-cta rounded-full px-6 py-2.5 text-sm font-normal hover:scale-[1.03]" onClick={begin}>Begin Journey</Button>
          <Button variant="glass" size="icon" className="rounded-full md:hidden" aria-label="Open navigation" onClick={() => openPanel("menu")}><Menu size={18} /></Button>
        </div>
      </header>

      <main id="main-content" className="hero relative z-10 flex flex-col items-center px-6 text-center">
        <h1 className="hero-title animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl" style={displayFont}>
          Where <em className="not-italic text-muted-foreground">dreams</em> rise <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        <p className="hero-description animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">We’re designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.</p>
        <div className="hero-action animate-fade-rise-delay-2 mt-12">
          <Button variant="glass" className="hero-cta cursor-pointer rounded-full px-14 py-5 text-base font-normal hover:scale-[1.03]" onClick={begin}>Begin Journey</Button>
        </div>
      </main>

      <Button variant="glass" size="icon" className="motion-control absolute bottom-5 right-5 z-10 rounded-full" aria-label={paused ? "Play background video" : "Pause background video"} onClick={() => { if (paused) void videoRef.current?.play().catch(() => setVideoFailed(true)); else videoRef.current?.pause(); }}>
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </Button>
      {videoFailed && <p role="status" className="absolute bottom-6 left-6 z-10 text-xs text-muted-foreground">The background film is unavailable. You can still explore Velorah.</p>}

      <Dialog open={panel !== null} onOpenChange={(open) => { if (!open) setPanel(null); }}>
        <DialogContent className="velorah-dialog" onCloseAutoFocus={(event) => { event.preventDefault(); returnFocusRef.current?.focus(); }}>
          {panel === "menu" ? <>
            <DialogHeader><DialogTitle style={displayFont}>Explore Velorah.</DialogTitle><DialogDescription>A little room to find your way.</DialogDescription></DialogHeader>
            <nav aria-label="Mobile navigation" className="flex flex-col items-start gap-5 py-4">
              <button onClick={() => setPanel(null)}>Home</button>
              {Object.keys(pages).map((name) => <button key={name} onClick={() => openPanel(name as keyof typeof pages)}>{name}</button>)}
            </nav>
          </> : panel === "journey" ? <>
            <DialogHeader>
              <DialogTitle style={displayFont}>{started ? "Every dream starts somewhere." : "A little space to begin."}</DialogTitle>
              <DialogDescription>{started ? "Your intention is saved in this browser. Take a breath, close this window, and make a little room for it today." : "What would you like to make room for today? Give your next idea a small beginning."}</DialogDescription>
            </DialogHeader>
            {started ? <><p className="my-5 break-words text-2xl" style={displayFont}>{intention}</p><Button variant="glass" onClick={() => setPanel(null)}>Find your focus</Button></> :
              <form onSubmit={(event) => { event.preventDefault(); if (!intention.trim()) return; try { localStorage.setItem("velorah-intention", intention.trim()); setStarted(true); } catch { setSaveError(true); } }} className="mt-3 space-y-5">
                <label className="block text-sm" htmlFor="intention">My intention</label>
                <input id="intention" className="w-full rounded-xl border border-border bg-secondary/30 p-4 text-base outline-none focus:border-foreground/60" placeholder="An idea, a project, a fresh perspective…" value={intention} onChange={(event) => setIntention(event.target.value)} required maxLength={160} />
                <p className="text-xs text-muted-foreground">Only saved on your device. Nothing is sent.</p>
                {saveError && <p role="alert" className="text-sm">Your browser couldn’t save this intention. Please allow local storage and try again.</p>}
                <Button variant="glass" type="submit" disabled={!intention.trim()}>Make room for it</Button>
              </form>}
          </> : panel && <>
            <DialogHeader><DialogTitle style={displayFont}>{pages[panel].title}</DialogTitle><DialogDescription>{pages[panel].description}</DialogDescription></DialogHeader>
            <Button variant="glass" className="mt-5" onClick={begin}>Begin Journey</Button>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
