"use client";

import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

import { shortenAddress } from "@/lib/contracts";

export function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [open, setOpen] = useState(false);

  const allowedConnectors = useMemo(
    () =>
      connectors.filter((connector) => {
        const id = connector.id.toLowerCase();
        return id.includes("coinbase") || id.includes("injected");
      }),
    [connectors],
  );

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        {chainId !== base.id && (
          <button
            type="button"
            onClick={() => switchChainAsync({ chainId: base.id })}
            className="inline-flex min-h-11 items-center rounded-full bg-governance-blue px-4 text-xs font-semibold text-white"
          >
            Switch to Base
          </button>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-governance-ink shadow-panel"
        >
          {shortenAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 items-center rounded-full bg-governance-blue px-4 text-sm font-semibold text-white"
      >
        Connect Wallet
      </button>

      {open && (
        <div className="absolute right-0 top-[56px] z-50 w-52 rounded-[24px] border border-white/80 bg-white p-2 shadow-panel">
          {allowedConnectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              onClick={() => {
                connect({ connector, chainId: base.id });
                setOpen(false);
              }}
              className="flex min-h-11 w-full items-center rounded-[18px] px-3 text-left text-sm font-medium text-governance-ink hover:bg-governance-bg"
            >
              {isPending ? "Connecting..." : connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
