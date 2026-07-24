import type { CampaignId } from "../domain/types";
import { CAMPAIGNS } from "../data/campaigns";
import { ChannelBadge } from "./ui";

interface Props {
  onOpen: (id: CampaignId) => void;
  onBack: () => void;
}

const ROWS: { label: string; render: (c: (typeof CAMPAIGNS)[number]) => React.ReactNode }[] = [
  { label: "Primary strength", render: (c) => <span className="font-medium">{c.primaryStrength}</span> },
  { label: "What makes it uniquely strong", render: (c) => <span className="text-ink/70">{c.uniqueStrength}</span> },
  {
    label: "Why it works",
    render: (c) => (
      <ul className="space-y-1">
        {c.whyItWorks.map((w) => (
          <li key={w} className="text-[12px] text-ink/70 flex gap-1.5">
            <span className="text-outcome shrink-0">✓</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    ),
  },
  { label: "Best suited for", render: (c) => <span className="text-ink/70">{c.bestFor}</span> },
  { label: "Approx. period", render: (c) => c.period },
  {
    label: "First direct touch",
    render: (c) => <ChannelBadge channel={c.stages.find((s) => s.channel !== "preparation" && s.channel !== "linkedin")?.channel ?? c.mainChannels[0]} small />,
  },
  {
    label: "Channel order",
    render: (c) => (
      <div className="flex flex-wrap gap-1">
        {c.mainChannels.map((ch) => (
          <ChannelBadge key={ch} channel={ch} small />
        ))}
      </div>
    ),
  },
  { label: "Stages", render: (c) => `${c.stages.length} stages` },
];

export function CampaignComparison({ onOpen, onBack }: Props) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <button className="text-sm text-ink/50 hover:text-ink mb-4" onClick={onBack}>
        ← Back to campaigns
      </button>
      <h1 className="text-2xl font-bold mb-1">Compare campaigns</h1>
      <p className="text-ink/70 mb-4 max-w-3xl">
        The same account — Harbor Community Health Center — could move through any of these three versions. They share
        one rule set and the same nine end states, and all three aim at the same goal:{" "}
        <strong>meaningful engagement or a positive reply across the account set</strong>. They differ in how the first
        touch is made and how channels change — each is strong for a different kind of account.
      </p>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {CAMPAIGNS.map((c) => (
          <div key={c.id} className="rounded-lg border border-outcome/15 bg-outcome/[0.05] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-outcome/70">{c.name}</div>
            <div className="text-sm font-medium mt-0.5">{c.primaryStrength}</div>
            <p className="text-[12px] text-ink/70 leading-snug mt-1">{c.uniqueStrength}</p>
          </div>
        ))}
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <th className="text-left p-4 w-40 text-ink/50 font-medium text-xs uppercase tracking-wide">Dimension</th>
              {CAMPAIGNS.map((c) => (
                <th key={c.id} className="text-left p-4 align-top">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-ink/55 font-normal mt-0.5">{c.description}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-black/5 last:border-0">
                <td className="p-4 text-xs uppercase tracking-wide text-ink/40 font-medium align-top">{row.label}</td>
                {CAMPAIGNS.map((c) => (
                  <td key={c.id} className="p-4 align-top">
                    {row.render(c)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4" />
              {CAMPAIGNS.map((c) => (
                <td key={c.id} className="p-4">
                  <button className="btn-primary text-xs !py-1.5" onClick={() => onOpen(c.id)}>
                    Open {c.name.split(" ")[0]}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel p-5 mt-4">
        <h2 className="font-semibold mb-2">Shared rules across all three</h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-ink/75">
          {[
            "A genuine positive reply pauses the programmed sequence.",
            "Passive signals (opens, views, impressions) stay awareness — never intent.",
            "A referral opens a full new-persona route, not a resent message.",
            "“Not now” records a reason and moves to a timed nurture.",
            "Silence cannot create endless follow-ups — attempts are capped.",
            "Opt-out stops and suppresses direct outreach immediately.",
            "Wrong contacts are corrected before the campaign continues.",
            "A rejected physical gesture is never retried.",
            "Contact pressure is capped per persona, with a warning at the limit.",
          ].map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-outcome">✓</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
