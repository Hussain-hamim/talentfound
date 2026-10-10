"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Code2, BriefcaseBusiness, ArrowRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { mutate } from "@/lib/platform/api";
import { splitList } from "@/lib/platform/validation";
import { Field, Heading, Status } from "./ui";
export function Onboarding({
  name,
  role: initialRole,
  next,
}: {
  name: string;
  role: string;
  next: string;
}) {
  const [role, setRole] = useState(
    initialRole === "recruiter" || initialRole === "founder"
      ? "recruiter"
      : "developer",
  );
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const d = new FormData(e.currentTarget);
    try {
      await mutate(
        "onboard",
        role === "developer"
          ? {
              role,
              name: d.get("name"),
              headline: d.get("headline"),
              location: d.get("location"),
              timezone: d.get("timezone"),
              skills: splitList(String(d.get("skills"))),
            }
          : {
              role,
              name: d.get("name"),
              company: d.get("company"),
              intent: d.get("intent"),
            },
      );
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="platform">
      <main id="main-content" className="pf-onboarding">
        <Brand />
        <Heading
          eyebrow={`A LITTLE ABOUT YOU · ${step} OF 2`}
          title={step === 1 ? "What brings you here?" : "Just the essentials."}
          description={
            step === 1
              ? "Choose where to start. You can add the other workspace whenever you like."
              : "A few details to make your first introduction. The rest can wait."
          }
        />
        <Status error={error} />
        {step === 1 ? (
          <>
            <div className="pf-role-grid">
              {[
                {
                  id: "developer",
                  title: "I build things.",
                  text: "Show your work. Get discovered. Find your next collaboration.",
                  icon: Code2,
                },
                {
                  id: "recruiter",
                  title: "I’m finding talent.",
                  text: "Meet developers. Build a shortlist. Bring your next idea to life.",
                  icon: BriefcaseBusiness,
                },
              ].map((item) => (
                <button
                  type="button"
                  aria-pressed={role === item.id}
                  className={`pf-role-card ${role === item.id ? "selected" : ""}`}
                  key={item.id}
                  onClick={() => setRole(item.id)}
                >
                  <item.icon size={24} />
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
            <div className="pf-form-footer" style={{ marginTop: 25 }}>
              <span className="pf-note">One account. Both possibilities.</span>
              <button className="pf-button primary" onClick={() => setStep(2)}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </>
        ) : (
          <form method="post" className="pf-form" onSubmit={submit}>
            <Field label="Your name">
              <input
                name="name"
                defaultValue={name}
                autoComplete="name"
                required
                maxLength={100}
              />
            </Field>
            {role === "developer" ? (
              <>
                <Field
                  label="What do you do?"
                  help="A short headline. You can change it later."
                >
                  <input
                    name="headline"
                    placeholder="Full-stack developer building thoughtful products"
                    required
                    maxLength={120}
                  />
                </Field>
                <div className="pf-form-grid">
                  <Field label="City and country">
                    <input
                      name="location"
                      placeholder="Kabul, Afghanistan"
                      required
                      maxLength={120}
                    />
                  </Field>
                  <Field label="Time zone">
                    <select
                      name="timezone"
                      defaultValue={
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      }
                    >
                      {Intl.supportedValuesOf("timeZone").map((zone) => (
                        <option key={zone}>{zone}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field
                  label="Your main skills"
                  help="One to five skills, separated by commas."
                >
                  <input
                    name="skills"
                    placeholder="React, TypeScript, Node.js"
                    required
                    maxLength={200}
                  />
                </Field>
                <p className="pf-note">
                  Your developer profile will be public so people can discover
                  you. Email and private account details stay private.
                </p>
              </>
            ) : (
              <>
                <Field
                  label="Company or project"
                  help="Working independently? Enter “Independent recruiter” or your project name."
                >
                  <input
                    name="company"
                    required
                    maxLength={120}
                    placeholder="Your team or next big idea"
                  />
                </Field>
                <Field label="What are you looking for?">
                  <select
                    name="intent"
                    defaultValue={
                      initialRole === "founder" ? "Co-founder" : "Hiring"
                    }
                  >
                    <option>Hiring</option>
                    <option>Co-founder</option>
                    <option>Collaboration</option>
                  </select>
                </Field>
              </>
            )}
            <div className="pf-form-footer">
              <button
                type="button"
                className="pf-button"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button disabled={pending} className="pf-button primary">
                {pending ? "Creating your workspace…" : "Make yourself at home"}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
