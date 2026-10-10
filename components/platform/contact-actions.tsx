import Link from "next/link";
import { MessageCircle, Send, Pencil } from "lucide-react";
import "@/app/contact-actions.css";

export function ContactActions({
  handle,
  name,
  demo = false,
  self = false,
}: {
  handle: string;
  name: string;
  demo?: boolean;
  self?: boolean;
}) {
  if (self)
    return (
      <div className="developer-contact">
        <Link className="developer-contact-secondary" href="/dashboard/profile">
          <Pencil size={16} aria-hidden="true" /> Edit your profile
        </Link>
        <p>This is your profile.</p>
      </div>
    );

  return (
    <div className="developer-contact">
      <div className="developer-contact-actions" aria-label={`Contact ${name}`}>
        {demo ? (
          <>
            <button className="developer-contact-primary" disabled>
              <MessageCircle size={17} aria-hidden="true" /> Message
            </button>
            <button className="developer-contact-secondary" disabled>
              <Send size={16} aria-hidden="true" /> Invite to project
            </button>
          </>
        ) : (
          <>
            <Link
              className="developer-contact-primary"
              href={`/developers/${handle}/message`}
              aria-label={`Message ${name}`}
            >
              <MessageCircle size={17} aria-hidden="true" /> Message
            </Link>
            <Link
              className="developer-contact-secondary"
              href={`/developers/${handle}/invite`}
              aria-label={`Invite ${name} to a project`}
            >
              <Send size={16} aria-hidden="true" /> Invite to project
            </Link>
          </>
        )}
      </div>
      {demo && <p>Demo profile · Messages and invitations are unavailable.</p>}
    </div>
  );
}
