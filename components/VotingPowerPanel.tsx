import { shortenAddress } from "@/lib/contracts";

type VotingPowerPanelProps = {
  value: string;
  tokenAddress?: string;
  tokenConfigured: boolean;
};

export function VotingPowerPanel({ value, tokenAddress, tokenConfigured }: VotingPowerPanelProps) {
  return (
    <section className="panel-surface rounded-panel p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">Voting Power</p>
      <p className="mt-3 text-2xl font-semibold text-governance-ink">{value}</p>
      <p className="mt-2 text-xs leading-5 text-governance-muted">
        {tokenConfigured
          ? `Governance token ${shortenAddress(tokenAddress)}`
          : "Governance token address is not configured yet, so balance display stays in fallback mode."}
      </p>
    </section>
  );
}
