import { ArrowUpRight, Globe } from "lucide-react";
import "@/app/profile-social-links.css";

export function ProfileSocialLinks({
  name,
  handle,
  github,
  linkedin,
  website,
  demo = false,
}: {
  name: string;
  handle: string;
  github: string;
  linkedin: string;
  website: string;
  demo?: boolean;
}) {
  const href = `/developers/${handle}`;
  const socialLinks = [
    { name: "GitHub", url: github, icon: "github" },
    { name: "LinkedIn", url: linkedin, icon: "linkedin" },
    { name: "Portfolio", url: website, icon: "portfolio" },
  ].filter(({ url }) => demo || /^https?:\/\//i.test(url?.trim() || ""));
  return (
    <>
      {socialLinks.length > 0 && (
        <ul className="profile-socials" aria-label={`${name}'s links`}>
          {socialLinks.map(({ name: network, url, icon }) => {
            const label = `${name}'s ${network}${demo ? " (demo)" : " (opens in a new tab)"}`;
            return (
              <li key={network}>
                <a
                  className={`profile-social-link${icon === "portfolio" ? " profile-portfolio" : ""}`}
                  href={
                    demo
                      ? `${href}#${icon === "portfolio" ? "work" : "demo-links"}`
                      : url.trim()
                  }
                  target={demo ? undefined : "_blank"}
                  rel={demo ? undefined : "noopener noreferrer"}
                  aria-label={label}
                  title={label}
                >
                  {icon === "portfolio" ? (
                    <>
                      <Globe size={15} aria-hidden="true" />
                      Portfolio
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      {icon === "github" ? (
                        <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.562.104.768-.244.768-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.79-1.51-3.79-1.51-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.077-.685.077-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.637 1.225 3.28.937.103-.728.394-1.225.715-1.507-2.498-.284-5.124-1.25-5.124-5.566 0-1.23.44-2.234 1.16-3.021-.117-.285-.503-1.43.11-2.98 0 0 .945-.302 3.095 1.154a10.79 10.79 0 0 1 5.634 0c2.148-1.456 3.09-1.154 3.09-1.154.615 1.55.229 2.695.113 2.98.722.787 1.158 1.791 1.158 3.021 0 4.327-2.63 5.279-5.136 5.558.404.349.764 1.04.764 2.096 0 1.513-.014 2.734-.014 3.105 0 .3.203.65.774.54A11.252 11.252 0 0 0 12 .75Z" />
                      ) : (
                        <>
                          <path d="M5.37 24H.4V7.98h4.97V24ZM2.88 5.8a2.88 2.88 0 1 1 0-5.76 2.88 2.88 0 0 1 0 5.76ZM24 24h-4.96v-7.8c0-1.86-.04-4.25-2.59-4.25-2.6 0-3 2.03-3 4.11V24H8.49V7.98h4.76v2.19h.07c.66-1.26 2.28-2.59 4.69-2.59 5.02 0 5.99 3.3 5.99 7.59V24Z" />
                        </>
                      )}
                    </svg>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
