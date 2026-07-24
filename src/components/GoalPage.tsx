interface Props {
  onBack: () => void;
}

const REASONS: { emoji: string; title: string; body: string }[] = [
  {
    emoji: "🎯",
    title: "We only reach out when we have something worth their time",
    body: "Every message is about their world — their sites, their staff, their pressures — not a generic pitch. People reply to things that feel written for them.",
  },
  {
    emoji: "👂",
    title: "We listen before we push",
    body: "If someone opens a message but stays quiet, we ease off and give it room. We follow what they actually do instead of sending the same thing again.",
  },
  {
    emoji: "🤝",
    title: "We show up as a familiar face first",
    body: "A little relevant presence beforehand means the first real message doesn't arrive from a stranger — so it's far more likely to be opened and answered.",
  },
  {
    emoji: "🌿",
    title: "We respect people's attention",
    body: "A genuine reply pauses everything and moves to a real conversation. We also cap how often we make contact, so we're never the ones being a nuisance.",
  },
  {
    emoji: "🔁",
    title: "We don't waste an account",
    body: "Wrong person? We find the right one. Bad timing? We note it and come back later with a fresh reason. Nobody quietly gets dropped.",
  },
  {
    emoji: "⚖️",
    title: "We keep score honestly",
    body: "A quick open or profile view is just a wave hello. Only a real reply, a question, a referral or a conversation counts as genuine interest.",
  },
];

export function GoalPage({ onBack }: Props) {
  return (
    <div className="min-h-screen board-grid">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button className="text-sm text-ink/50 hover:text-ink mb-6 inline-flex items-center gap-1" onClick={onBack}>
          <span aria-hidden>←</span> Back to campaigns
        </button>

        <div className="panel p-8 bg-gradient-to-br from-white to-outcome/[0.06]">
          <span className="chip bg-outcome/12 text-outcome font-semibold">The goal</span>
          <h1 className="text-3xl font-bold mt-3 leading-tight">Aiming for 8 in 10</h1>
          <p className="text-ink/70 mt-3 text-lg max-w-2xl leading-relaxed">
            Across a set of accounts, our goal is that <strong>8 in 10 either reply with interest or become genuinely
            engaged</strong>. It isn't a promise, and we never invent numbers to make it look certain. It's simply what a
            patient, respectful, relevant approach tends to earn.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {REASONS.map((r) => (
            <div key={r.title} className="panel p-5 hover:shadow-lift transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none shrink-0" aria-hidden>
                  {r.emoji}
                </span>
                <div>
                  <h2 className="font-semibold leading-snug">{r.title}</h2>
                  <p className="text-sm text-ink/65 mt-1.5 leading-relaxed">{r.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel p-5 mt-6 border-l-4 border-l-outcome">
          <p className="text-sm text-ink/70 leading-relaxed">
            <strong>One simple rule underneath it all:</strong> being noticed once — an open, a view, a delivery — is a
            start, but it isn't the same as someone being interested. We treat those as awareness only, and we keep
            working until there's a real reply. That honesty is exactly why the goal is worth aiming for.
          </p>
        </div>
      </div>
    </div>
  );
}
