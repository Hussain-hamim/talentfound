"use client";

import { Children, useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function ProfileReviewList({ children }: { children: ReactNode }) {
  const reviews = Children.toArray(children);
  const [expanded, setExpanded] = useState(false);
  const moreReviewsId = useId();
  const hasMore = reviews.length > 2;

  return (
    <div className="dp-review-list">
      <div className="dp-reviews">
        {reviews.slice(0, 2)}
        {hasMore && (
          <div
            className="dp-more-reviews"
            id={moreReviewsId}
            hidden={!expanded}
          >
            {reviews.slice(2)}
          </div>
        )}
      </div>
      {hasMore && (
        <button
          type="button"
          className="dp-reviews-toggle"
          aria-expanded={expanded}
          aria-controls={moreReviewsId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
