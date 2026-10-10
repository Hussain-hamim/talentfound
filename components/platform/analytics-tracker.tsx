"use client";
import { useEffect } from "react";
export function AnalyticsTracker({ developerId }: { developerId: string }) {
  useEffect(() => {
    function track(kind: "profile_view" | "project_click", projectId?: string) {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerId, kind, projectId }),
        keepalive: true,
      }).catch(() => {});
    }
    track("profile_view");
    const clicked = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest("[data-track-project]")
          : null;
      if (target instanceof HTMLElement && target.dataset.trackProject)
        track("project_click", target.dataset.trackProject);
    };
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, [developerId]);
  return null;
}
