import { ConnectionArt } from "./connection-art";
import Link from "next/link";
import { Arrow } from "./brand";
import { ProfilePassport } from "./profile-passport";

export function ProfileChapter() {
  return (
    <section className="profile-chapter" id="your-profile">
      <div className="chapter-inner">
        <div className="chapter-copy" data-reveal>
          <span className="section-kicker">A LINK THAT FEELS LIKE YOU.</span>
          <h2>
            Your corner
            <br />
            of the <span>internet.</span>
          </h2>
          <p>
            The things you’ve made.
            <br />
            The tools you love. The person behind it all.
          </p>
          <Link className="chapter-text-link" href="/signup">
            Make yourself at home <Arrow diagonal />
          </Link>
          <div className="profile-side-caption">
            <span className="chapter-doodle" aria-hidden="true">
              ✳
            </span>
            <span>
              NOT A FORM TO FILL.
              <br />A STORY TO TELL.
            </span>
          </div>
        </div>
        <ProfilePassport />
      </div>
    </section>
  );
}

const opportunities = [
  {
    title: "Your next team.",
    label: "FULL-TIME",
    copy: "A place to do your best work. With people who bring it out of you.",
    link: "Get discovered",
    href: "/signup",
    type: "team",
  },
  {
    title: "Your own rhythm.",
    label: "FREELANCE",
    copy: "Interesting problems. Fresh collaborations. Room to work your way.",
    link: "Show your skills",
    href: "/signup",
    type: "freelance",
  },
  {
    title: "Your big what-if.",
    label: "CO-FOUNDERS",
    copy: "That idea you keep coming back to. Someone to build it with.",
    link: "Find your counterpart",
    href: "/signup?role=founder",
    type: "founder",
  },
];

export function OpportunityChapter() {
  return (
    <section className="opportunity-chapter" id="possibilities">
      <div className="opportunity-heading" data-reveal>
        <h2>
          One profile.
          <br />
          <span>Many possible futures.</span>
        </h2>
      </div>
      <div className="opportunity-tickets">
        {opportunities.map((item) => (
          <article
            className={`opportunity-ticket ticket-${item.type}`}
            key={item.type}
            data-reveal
          >
            <div className="ticket-top">
              <span>{item.label}</span>
            </div>
            <div
              className={`ticket-symbol symbol-${item.type}`}
              aria-hidden="true"
            >
              {item.type === "team" ? (
                <>
                  <i />
                  <i />
                  <i />
                  <i />
                </>
              ) : item.type === "freelance" ? (
                <svg viewBox="0 0 200 150">
                  <path
                    d="M10 110 58 40v80l65-90v90l65-90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="22"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <>
                  <i />
                  <i />
                </>
              )}
            </div>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
            <Link href={item.href}>
              {item.link}
              <Arrow diagonal />
            </Link>
            <div className="ticket-perforation" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

export function CofounderChapter() {
  return (
    <section className="cofounder-chapter" id="build-together">
      <div className="cofounder-art" data-reveal>
        <ConnectionArt variant="together" />
      </div>
      <div className="chapter-copy cofounder-copy" data-reveal>
        <h2>
          You bring
          <br />
          the <span>what-if.</span>
          <br />
          They bring
          <br />
          the <span>why-not.</span>
        </h2>
        <p>Different strengths. A shared itch to make something real.</p>
        <Link className="devmatch-glass devmatch-hero-cta" href="/signup?role=founder">
          Meet your other half
        </Link>
      </div>
    </section>
  );
}

const questions = [
  [
    "Is this another job board?",
    "Your work comes first here. TalentFound is being built around developer profiles, direct invitations, and co-founder connections, so the right people can discover you through what you make.",
  ],
  [
    "Do I have to be looking for a job?",
    "Not at all. You might be open to freelance work, a co-founder, or simply a good conversation. Your interests can change with you.",
  ],
  [
    "What should I put on my profile?",
    "Start with something you’re proud of: a shipped product, a side project, or a small experiment. Add your toolkit and a little about yourself. It doesn’t have to be a perfect portfolio.",
  ],
  [
    "Can I join if I’m just starting out?",
    "Yes. Curiosity and the things you’re making belong here, too. Personal projects and learning experiments help tell your story.",
  ],
  [
    "Can I create an account right now?",
    "You can explore the sign-up experience today. This is the UI preview; live accounts, profile publishing, and connections are coming in a later build.",
  ],
];

export function QuestionsChapter() {
  return (
    <section className="clarity-faq-section" id="questions" aria-labelledby="faq-title">
      <div className="clarity-faq-heading" data-reveal>
        <h2 id="faq-title">
          A little <span>clarity.</span>
        </h2>
      </div>
      <div className="clarity-faq-list" data-reveal>
        {questions.map(([question, answer], index) => (
          <details name="devmatch-questions" key={question} open={index === 0}>
            <summary>
              <span className="clarity-faq-number" aria-hidden="true">0{index + 1}</span>
              <span className="clarity-faq-question">{question}</span>
              <span className="clarity-faq-toggle" aria-hidden="true" />
            </summary>
            <div className="clarity-faq-answer"><p>{answer}</p></div>
          </details>
        ))}
      </div>
    </section>
  );
}
