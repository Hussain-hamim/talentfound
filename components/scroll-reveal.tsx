"use client";

import { useEffect } from "react";

/** Progressively enhance server-rendered content; it stays visible without JS. */
export function ScrollReveal() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (preference.matches || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealState = "visible";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );

    for (const element of elements) {
      // Don’t hide content already visible, including an anchored destination.
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.dataset.revealState = "pending";
        observer.observe(element);
      }
    }

    function revealAll() {
      if (!preference.matches) return;
      observer.disconnect();
      elements.forEach((element) => {
        delete element.dataset.revealState;
      });
    }
    preference.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", revealAll);
      elements.forEach((element) => {
        delete element.dataset.revealState;
      });
    };
  }, []);

  return null;
}
