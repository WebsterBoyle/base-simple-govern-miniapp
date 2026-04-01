import { Attribution } from "ox/erc8021";
import {
  formatEther as formatEtherViem,
  formatUnits,
  getAddress,
  isAddress,
  parseEther,
  type Address,
  type Hex,
  zeroAddress,
} from "viem";

export const APP_NAME = "BaseSimpleGovern";
export const BASE_APP_ID = (process.env.NEXT_PUBLIC_BASE_APP_ID ?? "178").trim();
const DEFAULT_CONTRACT_ADDRESS = "0x579718155947b37e872da069531047e92a8e99c1";
const envContractAddress = normalizeAddress(
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? DEFAULT_CONTRACT_ADDRESS).trim(),
);
export const CONTRACT_ADDRESS =
  envContractAddress === zeroAddress ? getAddress(DEFAULT_CONTRACT_ADDRESS) : envContractAddress;
export const ENV_GOVERNANCE_TOKEN_ADDRESS = normalizeAddress(
  (process.env.NEXT_PUBLIC_GOV_TOKEN_ADDRESS ?? "GOVERNANCE_TOKEN_ADDRESS_PLACEHOLDER").trim(),
);
export const MIN_STAKE_ETH = "0.01";
export const MIN_STAKE_WEI = parseEther(MIN_STAKE_ETH);

export const BUILDER_CODE =
  (process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "bc_93sc1p48").trim();

export const PROVIDED_BUILDER_SUFFIX =
  (
    process.env.NEXT_PUBLIC_BASE_BUILDER_SUFFIX ??
    "0x62635f39337363317034380b0080218021802180218021802180218021"
  ).trim() as Hex;

export const GENERATED_BUILDER_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});

export const DATA_SUFFIX: Hex = GENERATED_BUILDER_SUFFIX;
export const DATA_SUFFIX_MATCHES_PROVIDED = PROVIDED_BUILDER_SUFFIX === GENERATED_BUILDER_SUFFIX;

export type ProposalStatus = "active" | "ended" | "executed";

export function getProposalStatus(proposal: { start: bigint; end: bigint; executed: boolean }): ProposalStatus {
  if (proposal.executed) return "executed";
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= proposal.start && now <= proposal.end) return "active";
  return "ended";
}

export function getProposalStatusTone(status: ProposalStatus) {
  if (status === "active") return "bg-[#e1f5f3] text-governance-accent";
  if (status === "ended") return "bg-[#fff0dc] text-governance-warning";
  return "bg-[#e7ebff] text-governance-blue";
}

export function formatTokenAmount(value: bigint, decimals = 18) {
  if (value === 0n) return "0";
  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmedFraction = fraction.replace(/0+$/, "").slice(0, 4);
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

export function formatTimestamp(value: bigint) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(Number(value) * 1000));
}

export function formatLocalTime(isoString: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export function shortenAddress(address?: string | null) {
  if (!address) return "Not set";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(value: bigint) {
  return formatEtherViem(value);
}

function normalizeAddress(value: string): Address {
  return isAddress(value) ? getAddress(value) : zeroAddress;
}
