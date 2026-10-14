export const ARC_TIP_CONTRACT_ADDRESS =
  "0xBD437E3378eae16a082580e26157575523Ba852f" as const;

// BOT Chain Mainnet contract will be set here once deployed
export const BOT_CHAIN_CONTRACT_ADDRESS: `0x${string}` | null = null;

export function getContractAddressForChain(
  chainId?: number | null
): `0x${string}` | null {
  if (chainId === 677) {
    return BOT_CHAIN_CONTRACT_ADDRESS;
  }
  return ARC_TIP_CONTRACT_ADDRESS;
}

export const ARC_TIP_ABI = [
  {
    type: "function",
    name: "tip",
    stateMutability: "payable",
    inputs: [
      { name: "to", type: "address" },
      { name: "memo", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "totalReceived",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "tipCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalTips",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Tip",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "memo", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
