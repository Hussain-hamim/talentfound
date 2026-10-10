"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="profile-modal-message" role="alert">
      <h2>We couldn’t load this profile.</h2>
      <p>Please try again in a moment.</p>
      <button className="pf-button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
