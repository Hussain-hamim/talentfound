"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { Arrow } from "./brand";
import { ProjectCover } from "./landing-experience";

const tabs = ["The work", "The toolkit", "The person"];

export function ProfilePassport() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function navigateTabs(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="passport-stage" data-reveal>
      <span className="passport-margin-note">
        A LITTLE WINDOW INTO YOUR WORLD.
      </span>
      <div className="profile-passport">
        <div className="passport-topline">
          <span>TALENTFOUND / PEOPLE</span>
          <span>EXAMPLE PROFILE ↗</span>
        </div>
        <div className="passport-identity">
          <span className="passport-avatar" aria-hidden="true">
            am<span>✳</span>
          </span>
          <div>
            <h3>
              Alex Morgan<span>.</span>
            </h3>
            <p>Frontend developer. Endlessly curious.</p>
          </div>
        </div>
        <div
          className="passport-tabs"
          role="tablist"
          aria-label="Explore the example profile"
        >
          {tabs.map((label, index) => (
            <button
              key={label}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`passport-tab-${index}`}
              aria-selected={active === index}
              aria-controls="passport-panel"
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => navigateTabs(event, index)}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          id="passport-panel"
          className="passport-panel"
          role="tabpanel"
          aria-labelledby={`passport-tab-${active}`}
          tabIndex={0}
        >
          {active === 0 ? (
            <div className="passport-work" key="work">
              <ProjectCover kind="offscript" />
              <div className="passport-project-caption">
                <span>
                  Offscript<small>A home for independent ideas.</small>
                </span>
                <span>
                  2026 <Arrow diagonal />
                </span>
              </div>
            </div>
          ) : active === 1 ? (
            <div className="passport-toolkit" key="toolkit">
              <span className="passport-panel-label">
                THINGS I LIKE BUILDING WITH
              </span>
              <div>
                {[
                  "React",
                  "TypeScript",
                  "Next.js",
                  "CSS",
                  "Figma",
                  "A little curiosity ↗",
                ].map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <p>
                Interfaces with a point of view.
                <br />
                Details that make a difference.
              </p>
            </div>
          ) : (
            <div className="passport-about" key="about">
              <span className="passport-panel-label">
                A PERSON BEHIND THE PIXELS
              </span>
              <p>“I like making the internet a little more interesting.”</p>
              <div>
                <span>Based on Earth.</span>
                <span>Open to what’s next. ↗</span>
              </div>
            </div>
          )}
        </div>
        <div className="passport-status">
          <span>
            <i /> Open to good conversations
          </span>
          <Link href="/signup">
            Make yours <Arrow diagonal />
          </Link>
        </div>
      </div>
      <span className="passport-sticker" aria-hidden="true">
        100%
        <br />
        <b>YOU.</b>
      </span>
    </div>
  );
}
