"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import "@/app/dashboard/dashboard.css";
import "@/app/profile-modal.css";

function findSection(dialog: HTMLDialogElement, hash: string) {
  try {
    return dialog.querySelector<HTMLElement>(
      `[id="${CSS.escape(decodeURIComponent(hash))}"]`,
    );
  } catch {
    return null;
  }
}

export function ProfileModal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backdropPointer = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    delete dialog.dataset.closing;
    dialog.showModal();

    // A project/review link may open before its streamed section exists.
    const hash = window.location.hash.slice(1);
    let observer: MutationObserver | undefined;
    if (hash) {
      const scrollToSection = () => {
        const target = findSection(dialog, hash);
        if (!target) return false;
        target.scrollIntoView({ block: "start", behavior: "instant" });
        return true;
      };
      if (!scrollToSection()) {
        observer = new MutationObserver(() => {
          if (scrollToSection()) observer?.disconnect();
        });
        observer.observe(dialog, { childList: true, subtree: true });
      }
    }

    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = null;
      observer?.disconnect();
      dialog.close();
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  function close() {
    const dialog = dialogRef.current;
    if (!dialog || closeTimer.current) return;
    dialog.dataset.closing = "true";
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    closeTimer.current = setTimeout(
      () => router.back(),
      reducedMotion ? 0 : 180,
    );
  }

  function navigateSection(event: MouseEvent<HTMLDialogElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link =
      event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement) || link.target === "_blank")
      return;
    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      !url.hash
    )
      return;
    const section =
      dialogRef.current && findSection(dialogRef.current, url.hash.slice(1));
    if (!section) return;
    // Keep in-profile anchors out of history so closing always returns to the directory.
    event.preventDefault();
    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="profile-modal platform"
      aria-labelledby="profile-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href], button, input, textarea, select, summary, [tabindex]",
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            element.getClientRects().length > 0,
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last &&
          first
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onClickCapture={navigateSection}
      onPointerDown={(event) => {
        backdropPointer.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (backdropPointer.current && event.target === event.currentTarget)
          close();
        backdropPointer.current = false;
      }}
    >
      <div className="profile-modal-shell">
        <header className="profile-modal-toolbar">
          <span id="profile-modal-title">Developer profile</span>
          <button
            type="button"
            className="profile-modal-close"
            aria-label="Close profile"
            onClick={close}
            autoFocus
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div
          className="profile-modal-scroll"
          tabIndex={0}
          role="region"
          aria-label="Profile details"
        >
          {children}
        </div>
        <div className="profile-modal-bottom-blur" aria-hidden="true" />
      </div>
    </dialog>
  );
}
