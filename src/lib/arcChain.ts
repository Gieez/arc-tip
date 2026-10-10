import { defineChain } from "viem";

export const arcMainnet = defineChain({
  id: 5042,
  name: "Arc Mainnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.arc.io"],
    },
    public: {
      http: [
        "https://rpc.mainnet.arc.io",
        "https://arc.drpc.org",
        "https://rpc.blockdaemon.mainnet.arc.io",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.arc.io",
    },
  },
});
