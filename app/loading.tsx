export default function Loading() {
  return (
    <div className="container page" aria-busy="true">
      <p className="eyebrow">Loading headquarters…</p>
      <div className="skeleton" />
    </div>
  );
}
