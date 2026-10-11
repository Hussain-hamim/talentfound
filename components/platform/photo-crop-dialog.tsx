"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { RotateCcw, X } from "lucide-react";
import { squareCrop, type CropPosition } from "@/lib/platform/image-crop";
import { Status } from "./ui";
import "@/app/photo-crop.css";

export function PhotoCropDialog({
  file,
  onCancel,
  onSave,
}: {
  file: File;
  onCancel: () => void;
  onSave: (file: File) => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    position: CropPosition;
  } | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState<CropPosition>({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    let active = true;
    const src = URL.createObjectURL(file);
    const photo = new window.Image();
    photo.onload = () => {
      if (active) setImage(photo);
    };
    photo.onerror = () => {
      if (active)
        setError("We couldn’t open this image. Please choose another photo.");
    };
    photo.src = src;
    return () => {
      active = false;
      photo.onload = null;
      photo.onerror = null;
      URL.revokeObjectURL(src);
    };
  }, [file]);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!image || !context) return;
    const crop = squareCrop(
      image.naturalWidth,
      image.naturalHeight,
      zoom,
      position,
    );
    context.clearRect(0, 0, 640, 640);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.size,
      crop.size,
      0,
      0,
      640,
      640,
    );
  }, [image, position, zoom]);

  function constrain(next: CropPosition, nextZoom = zoom) {
    if (!image) return next;
    const crop = squareCrop(
      image.naturalWidth,
      image.naturalHeight,
      nextZoom,
      next,
    );
    return {
      x: (crop.x + crop.size / 2) / image.naturalWidth,
      y: (crop.y + crop.size / 2) / image.naturalHeight,
    };
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      !image ||
      !drag.current ||
      drag.current.id !== event.pointerId ||
      saving
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const size = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const next = constrain({
      x:
        drag.current.position.x -
        (((event.clientX - drag.current.x) / bounds.width) * size) /
          image.naturalWidth,
      y:
        drag.current.position.y -
        (((event.clientY - drag.current.y) / bounds.height) * size) /
          image.naturalHeight,
    });
    setPosition(next);
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      position: next,
    };
  }

  function nudge(event: KeyboardEvent<HTMLDivElement>) {
    if (!image || saving) return;
    const direction: Record<string, [number, number]> = {
      ArrowLeft: [1, 0],
      ArrowRight: [-1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    const delta = direction[event.key];
    if (!delta) return;
    event.preventDefault();
    const distance =
      (Math.min(image.naturalWidth, image.naturalHeight) / zoom) *
      (event.shiftKey ? 0.1 : 0.02);
    setPosition(
      constrain({
        x: position.x + (delta[0] * distance) / image.naturalWidth,
        y: position.y + (delta[1] * distance) / image.naturalHeight,
      }),
    );
  }

  async function save() {
    if (!image || saving) return;
    setSaving(true);
    setError("");
    try {
      const crop = squareCrop(
        image.naturalWidth,
        image.naturalHeight,
        zoom,
        position,
      );
      const output = document.createElement("canvas");
      output.width = output.height = Math.max(
        1,
        Math.min(512, Math.round(crop.size)),
      );
      const context = output.getContext("2d");
      if (!context)
        throw new Error("Could not prepare your photo. Please try again.");
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.size,
        crop.size,
        0,
        0,
        output.width,
        output.height,
      );
      const blob = await new Promise<Blob>((resolve, reject) => {
        output.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(
                  new Error(
                    "Could not crop this image. Please try another photo.",
                  ),
                ),
          "image/png",
        );
      });
      onSave(new File([blob], "profile-photo.png", { type: "image/png" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not crop this image.");
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="pf-crop-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-hint`}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onCancel();
      }}
    >
      <header className="pf-crop-header">
        <div>
          <span className="pf-eyebrow">MAKE IT YOURS</span>
          <h2 id={`${id}-title`}>Frame your photo.</h2>
        </div>
        <button
          type="button"
          className="pf-button small"
          aria-label="Close photo crop"
          disabled={saving}
          onClick={onCancel}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>
      <p id={`${id}-hint`} className="pf-note">
        Drag to reposition, then zoom to find your best crop. You can also use
        the arrow keys.
      </p>
      <div
        className="pf-crop-viewport"
        role="group"
        aria-label="Photo crop area"
        aria-describedby={`${id}-hint`}
        tabIndex={image && !saving ? 0 : -1}
        onKeyDown={nudge}
        onPointerDown={(event) => {
          if (!image || saving || event.button !== 0 || drag.current) return;
          event.preventDefault();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            position,
          };
        }}
        onPointerMove={move}
        onPointerUp={(event) => {
          if (drag.current?.id === event.pointerId) {
            drag.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <canvas
          ref={canvas}
          width={640}
          height={640}
          aria-label="Cropped profile photo preview"
          role="img"
        />
        <div className="pf-crop-mask" aria-hidden="true" />
        {!image && (
          <span className="pf-crop-loading" role="status">
            {error ? "Image unavailable" : "Loading photo…"}
          </span>
        )}
      </div>
      <div className="pf-crop-controls">
        <label htmlFor={`${id}-zoom`}>
          Zoom <output>{Math.round(zoom * 100)}%</output>
        </label>
        <input
          id={`${id}-zoom`}
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          disabled={!image || saving}
          onChange={(event) => {
            const value = Number(event.currentTarget.value);
            setZoom(value);
            setPosition(constrain(position, value));
          }}
        />
        <button
          type="button"
          className="pf-button small"
          disabled={!image || saving}
          onClick={() => {
            setZoom(1);
            setPosition({ x: 0.5, y: 0.5 });
          }}
        >
          <RotateCcw size={14} aria-hidden="true" /> Reset crop
        </button>
      </div>
      <Status error={error} />
      <footer className="pf-crop-footer">
        <button
          type="button"
          className="pf-button"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="pf-button primary"
          disabled={!image || saving}
          onClick={() => void save()}
        >
          {saving ? "Preparing photo…" : "Done"}
        </button>
      </footer>
    </dialog>
  );
}
