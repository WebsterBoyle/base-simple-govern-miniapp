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
export const BASE_APP_ID = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "69cc80706a64caf44d4853ef";
const DEFAULT_CONTRACT_ADDRESS = "0x579718155947b37e872da069531047e92a8e99c1";
const envContractAddress = normalizeAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? DEFAULT_CONTRACT_ADDRESS);
export const CONTRACT_ADDRESS =
  envContractAddress === zeroAddress ? getAddress(DEFAULT_CONTRACT_ADDRESS) : envContractAddress;
export const ENV_GOVERNANCE_TOKEN_ADDRESS = normalizeAddress(
  process.env.NEXT_PUBLIC_GOV_TOKEN_ADDRESS ?? "GOVERNANCE_TOKEN_ADDRESS_PLACEHOLDER",
);
export const MIN_STAKE_ETH = "0.01";
export const MIN_STAKE_WEI = parseEther(MIN_STAKE_ETH);

// Replace the real Builder Code here when production attribution is issued.
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "BUILDER_CODE_PLACEHOLDER";

// Replace the real Encoded String here when you receive the final ERC-8021 suffix.
export const ENCODED_STRING =
  process.env.NEXT_PUBLIC_BASE_BUILDER_SUFFIX ?? "ENCODED_STRING_PLACEHOLDER";

const generatedFallbackSuffix = Attribution.toDataSuffix({
  appCode: sanitizeBuilderCode(BUILDER_CODE),
  metadata: {
    builder_code_placeholder: BUILDER_CODE,
  },
});

export const DATA_SUFFIX: Hex = isHexString(ENCODED_STRING)
  ? (ENCODED_STRING as Hex)
  : generatedFallbackSuffix;

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

function sanitizeBuilderCode(value: string) {
  const clean = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return clean || "basesimplegovern";
}

function isHexString(value: string) {
  return /^0x[0-9a-fA-F]*$/.test(value);
}
