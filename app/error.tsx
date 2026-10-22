"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page empty">
      <h1>The connection paused.</h1>
      <p>
        Trading records are temporarily unavailable. No local game state has
        been changed.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
