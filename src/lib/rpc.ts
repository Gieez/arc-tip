import { createPublicClient, http, parseAbiItem } from "viem";
import { arcMainnet } from "./arcChain";
import { ARC_TIP_CONTRACT_ADDRESS, ARC_TIP_ABI } from "./contract";

export const publicClient = createPublicClient({
  chain: arcMainnet,
  transport: http("https://rpc.mainnet.arc.io", {
    batch: true,
    retryCount: 3,
    timeout: 10_000,
  }),
});

export interface ArcNetworkStats {
  chainId: number;
  blockNumber: bigint;
  gasPriceGwei: string;
  isOnline: boolean;
}

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
}

export async function getArcNetworkStats(): Promise<ArcNetworkStats> {
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      publicClient.getBlockNumber(),
      publicClient.getGasPrice(),
    ]);

    const gasPriceGwei = (Number(gasPrice) / 1e9).toFixed(3);

    return {
      chainId: arcMainnet.id,
      blockNumber,
      gasPriceGwei,
      isOnline: true,
    };
  } catch (err) {
    console.error("Failed to fetch Arc network stats:", err);
    return {
      chainId: 5042,
      blockNumber: 0n,
      gasPriceGwei: "0.00",
      isOnline: false,
    };
  }
}

export async function getAccountBalance(address: string): Promise<bigint> {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return 0n;
  }
  try {
    return await publicClient.getBalance({
      address: address as `0x${string}`,
    });
  } catch {
    return 0n;
  }
}

export async function getRecipientStats(address: string): Promise<RecipientStats> {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return { totalReceived: 0n, tipCount: 0n };
  }
  try {
    const [totalReceived, tipCount] = await Promise.all([
      publicClient.readContract({
        address: ARC_TIP_CONTRACT_ADDRESS,
        abi: ARC_TIP_ABI,
        functionName: "totalReceived",
        args: [address as `0x${string}`],
      }),
      publicClient.readContract({
        address: ARC_TIP_CONTRACT_ADDRESS,
        abi: ARC_TIP_ABI,
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

export async function getGlobalTotalTips(): Promise<bigint> {
  try {
    const total = await publicClient.readContract({
      address: ARC_TIP_CONTRACT_ADDRESS,
      abi: ARC_TIP_ABI,
      functionName: "totalTips",
    });
    return total as bigint;
  } catch {
    return 0n;
  }
}

export async function getRecentTips(limit: number = 10): Promise<TipEvent[]> {
  try {
    const currentBlock = await publicClient.getBlockNumber();
    // Arc RPC limits eth_getLogs to max ~2000 blocks
    const fromBlock = currentBlock > 2000n ? currentBlock - 2000n : 0n;

    const logs = await publicClient.getLogs({
      address: ARC_TIP_CONTRACT_ADDRESS,
      event: parseAbiItem(
        "event Tip(address indexed from, address indexed to, uint256 amount, string memo)"
      ),
      fromBlock,
      toBlock: currentBlock,
    });

    const tips: TipEvent[] = logs.slice(-limit).reverse().map((log) => ({
      from: log.args.from as string,
      to: log.args.to as string,
      amount: log.args.amount as bigint,
      memo: (log.args.memo as string) || "",
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
    }));

    return tips;
  } catch (err) {
    console.warn("getLogs range constrained or unavailable:", err);
    return [];
  }
}
