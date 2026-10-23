import { createPublicClient, http, parseAbiItem } from "viem";
import { arcMainnet, botChainMainnet, getChainConfig } from "./chains";
import {
  getContractAddressForChain,
  getContractAbiForChain,
} from "./contract";

export const publicClient = createPublicClient({
  chain: arcMainnet,
  transport: http("https://rpc.mainnet.arc.io", {
    batch: true,
    retryCount: 3,
    timeout: 10_000,
  }),
});

export const botPublicClient = createPublicClient({
  chain: botChainMainnet,
  transport: http("https://rpc.botchain.ai", {
    batch: true,
    retryCount: 3,
    timeout: 10_000,
  }),
});

export function getPublicClient(chainId?: number | null) {
  if (chainId === 677) {
    return botPublicClient;
  }
  return publicClient;
}

export interface ArcNetworkStats {
  chainId: number;
  networkName: string;
  nativeSymbol: string;
  blockNumber: bigint;
  gasPriceGwei: string;
  isOnline: boolean;
}

export type NetworkStats = ArcNetworkStats;

export interface RecipientStats {
  totalReceived: bigint;
  tipCount: bigint;
}

export interface TipEvent {
  from: string;
  to: string;
  amount: bigint;
  memo: string;
  txHash: string;
  blockNumber: bigint;
  timestamp?: number;
  chainId?: number;
}

export async function getArcNetworkStats(
  chainId?: number | null
): Promise<ArcNetworkStats> {
  const client = getPublicClient(chainId);
  const config = getChainConfig(chainId);
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      client.getBlockNumber(),
      client.getGasPrice(),
    ]);

    const gasPriceGwei = (Number(gasPrice) / 1e9).toFixed(3);

    return {
      chainId: config.chain.id,
      networkName: config.name,
      nativeSymbol: config.symbol,
      blockNumber,
      gasPriceGwei,
      isOnline: true,
    };
  } catch (err) {
    console.error(`Failed to fetch ${config.name} network stats:`, err);
    return {
      chainId: config.chain.id,
      networkName: config.name,
      nativeSymbol: config.symbol,
      blockNumber: 0n,
      gasPriceGwei: "0.00",
      isOnline: false,
    };
  }
}

export async function getAccountBalance(
  address: string,
  chainId?: number | null
): Promise<bigint> {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return 0n;
  }
  const client = getPublicClient(chainId);
  try {
    return await client.getBalance({
      address: address as `0x${string}`,
    });
  } catch {
    return 0n;
  }
}

export async function getRecipientStats(
  address: string,
  chainId?: number | null
): Promise<RecipientStats> {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return { totalReceived: 0n, tipCount: 0n };
  }
  const contractAddress = getContractAddressForChain(chainId);
  if (!contractAddress) {
    return { totalReceived: 0n, tipCount: 0n };
  }

  const client = getPublicClient(chainId);
  const abi = getContractAbiForChain(chainId);
  try {
    const [totalReceived, tipCount] = await Promise.all([
      client.readContract({
        address: contractAddress,
        abi,
        functionName: "totalReceived",
        args: [address as `0x${string}`],
      }),
      client.readContract({
        address: contractAddress,
        abi,
        functionName: "tipCount",
        args: [address as `0x${string}`],
      }),
    ]);

    return {
      totalReceived: totalReceived as bigint,
      tipCount: tipCount as bigint,
    };
  } catch {
    return {
      totalReceived: 0n,
      tipCount: 0n,
    };
  }
}

export async function getGlobalTotalTips(
  chainId?: number | null
): Promise<bigint> {
  const contractAddress = getContractAddressForChain(chainId);
  if (!contractAddress) {
    return 0n;
  }

  const client = getPublicClient(chainId);
  const abi = getContractAbiForChain(chainId);
  try {
    const total = await client.readContract({
      address: contractAddress,
      abi,
      functionName: "totalTips",
    });
    return total as bigint;
  } catch {
    return 0n;
  }
}

export async function getRecentTips(
  chainId?: number | null,
  limit: number = 10
): Promise<TipEvent[]> {
  const contractAddress = getContractAddressForChain(chainId);
  if (!contractAddress) {
    return [];
  }

  const client = getPublicClient(chainId);
  const targetChainId = chainId || arcMainnet.id;
  try {
    const currentBlock = await client.getBlockNumber();

    // BOT Chain (677) has no 2000-block limitation; query from deployment block 26768000n.
    // Arc L1 limits eth_getLogs to max 2000 blocks per request.
    const fromBlock =
      targetChainId === 677
        ? 26768000n
        : currentBlock > 2000n
        ? currentBlock - 2000n
        : 0n;

    // BOT Chain contract event Tip does not have timestamp parameter; Arc contract does.
    const eventItem =
      targetChainId === 677
        ? parseAbiItem(
            "event Tip(address indexed from, address indexed to, uint256 amount, string memo)"
          )
        : parseAbiItem(
            "event Tip(address indexed from, address indexed to, uint256 amount, string memo, uint256 timestamp)"
          );

    const logs = await client.getLogs({
      address: contractAddress,
      event: eventItem,
      fromBlock,
      toBlock: currentBlock,
    });

    const tips: TipEvent[] = logs
      .slice(-limit)
      .reverse()
      .map((log) => {
        const args = log.args as {
          from: string;
          to: string;
          amount: bigint;
          memo?: string;
          timestamp?: bigint;
        };
        return {
          from: args.from,
          to: args.to,
          amount: args.amount,
          memo: args.memo || "",
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: args.timestamp ? Number(args.timestamp) : undefined,
          chainId: targetChainId,
        };
      });

    return tips;
  } catch (err) {
    console.warn("getLogs range constrained or unavailable:", err);
    return [];
  }
}
