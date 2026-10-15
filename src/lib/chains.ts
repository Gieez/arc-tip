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

export const botChainMainnet = defineChain({
  id: 677,
  name: "BOT Chain Mainnet",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.botchain.ai"],
    },
    public: {
      http: ["https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOT Chain Explorer",
      url: "https://scan.botchain.ai",
    },
  },
});

export interface ChainConfig {
  chain: typeof arcMainnet | typeof botChainMainnet;
  name: string;
  shortName: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress?: `0x${string}`;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  5042: {
    chain: arcMainnet,
    name: "Arc Mainnet",
    shortName: "Arc L1",
    symbol: "USDC",
    decimals: 18,
    rpcUrl: "https://rpc.mainnet.arc.io",
    explorerUrl: "https://explorer.arc.io",
    contractAddress: "0xBD437E3378eae16a082580e26157575523Ba852f",
  },
  677: {
    chain: botChainMainnet,
    name: "BOT Chain Mainnet",
    shortName: "BOT Chain",
    symbol: "BOT",
    decimals: 18,
    rpcUrl: "https://rpc.botchain.ai",
    explorerUrl: "https://scan.botchain.ai",
    contractAddress: "0xe0ba8adf0cd660f5875aca70a98e466f30855dec",
  },
};

export const DEFAULT_CHAIN_ID = 5042;

export function getChainConfig(chainId?: number | null): ChainConfig {
  if (chainId && SUPPORTED_CHAINS[chainId]) {
    return SUPPORTED_CHAINS[chainId];
  }
  return SUPPORTED_CHAINS[DEFAULT_CHAIN_ID];
}
