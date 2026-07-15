type ErrorStateProps = {
  message: string;
};

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-sm border border-[#404040] bg-[#171717] p-6"
    >
      <h2 className="doc-section-title text-[#f5f5f5]">
        Unable to load leaderboard
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#d4d4d4]">{message}</p>
    </section>
  );
}
