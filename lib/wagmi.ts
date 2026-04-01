import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { base } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "BaseSimpleGovern",
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});
