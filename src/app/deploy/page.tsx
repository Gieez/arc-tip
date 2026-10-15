"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { useArcWallet } from "@/lib/useArcWallet";
import { ARCTIP_BYTECODE } from "@/lib/bytecode";
import { ARC_TIP_ABI } from "@/lib/contract";
import { getChainConfig } from "@/lib/chains";
import { createWalletClient, custom } from "viem";
import {
  Rocket,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function DeployPage() {
  const {
    account,
    balance,
    chainId,
    selectedChainId,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
  } = useArcWallet();

  const [loading, setLoading] = useState(false);
  const [deployedContract, setDeployedContract] = useState<string | null>(null);
  const [deployTxHash, setDeployTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const chainConfig = getChainConfig(selectedChainId);

  const handleDeploy = async () => {
    if (!account) {
      await connect();
      return;
    }

    if (typeof window === "undefined" || !window.ethereum) {
      setErrorMsg("No Web3 wallet extension found. Open this page in MetaMask Mobile or your Web3 browser.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const walletClient = createWalletClient({
        chain: chainConfig.chain,
        transport: custom(window.ethereum),
      });

      // Ensure wallet is on the target chain
      const currentChainId = await walletClient.getChainId();
      if (currentChainId !== chainConfig.chain.id) {
        await switchNetwork(chainConfig.chain.id);
      }

      // Deploy contract
      const hash = await walletClient.deployContract({
        abi: ARC_TIP_ABI,
        bytecode: ARCTIP_BYTECODE,
        account: account as `0x${string}`,
      });

      setDeployTxHash(hash);

      // Wait for receipt via standard public client polling
      const { getPublicClient } = await import("@/lib/rpc");
      const pubClient = getPublicClient(chainConfig.chain.id);
      const receipt = await pubClient.waitForTransactionReceipt({
        hash,
        timeout: 45_000,
      });

      if (receipt.contractAddress) {
        setDeployedContract(receipt.contractAddress);
        refreshBalance(account, chainConfig.chain.id);
      } else {
        setErrorMsg("Contract deployment receipt did not return an address.");
      }
    } catch (err: unknown) {
      console.error("Deploy error:", err);
      const e = err as { shortMessage?: string; message?: string };
      setErrorMsg(e?.shortMessage || e?.message || "Deployment failed or was rejected.");
    } finally {
      setLoading(false);
    }
  };

  const shareText = `ArcTipJar Deployed on ${chainConfig.name} (Chain ID: ${chainConfig.chain.id})
Contract Address: ${deployedContract || ""}
Deployment Tx: ${deployTxHash || ""}
Explorer Link: ${chainConfig.explorerUrl}/address/${deployedContract || ""}
Live App: https://arc-tip-phi.vercel.app`;

  const copyResults = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col font-sans selection:bg-[#00D2FF]/20 selection:text-[#00D2FF]">
      <Header
        account={account}
        balance={balance}
        chainId={chainId}
        selectedChainId={selectedChainId}
        onConnect={connect}
        onDisconnect={disconnect}
        onOpenNetworkModal={() => {}}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121722] border border-[#1E2638] text-xs font-mono text-[#00D2FF]">
            <Rocket className="w-3.5 h-3.5" />
            <span>Mobile-Ready Contract Launcher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Deploy ArcTipJar to {chainConfig.name}
          </h1>
          <p className="text-xs text-[#94A3B8]">
            One-click deployment tool designed for desktop and mobile wallets (MetaMask / OKX / Rabby).
          </p>
        </div>

        <div className="bg-[#121722] border border-[#1E2638] rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-[#0B0E14] rounded-lg border border-[#1E2638] text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Target Network:</span>
                <span className="text-white font-medium">{chainConfig.name} ({chainConfig.chain.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Gas Token:</span>
                <span className="text-[#00D2FF] font-medium">{chainConfig.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Connected Wallet:</span>
                <span className="text-white font-medium">{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not Connected"}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {deployedContract && (
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Deployment Succeeded!</span>
                </div>
                <div className="text-xs font-mono space-y-1 text-white bg-[#0B0E14] p-3 rounded border border-[#1E2638]">
                  <p className="break-all"><strong className="text-[#94A3B8]">Contract:</strong> {deployedContract}</p>
                  <p className="break-all"><strong className="text-[#94A3B8]">Tx Hash:</strong> {deployTxHash}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyResults}
                    className="flex-1 py-2 px-3 rounded bg-[#00D2FF] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAll ? "Copied for Telegram!" : "Copy Details for Telegram"}</span>
                  </button>
                  <a
                    href={`${chainConfig.explorerUrl}/address/${deployedContract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded bg-[#182030] text-white text-xs border border-[#1E2638] flex items-center gap-1"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {!deployedContract && (
              <button
                onClick={handleDeploy}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  loading
                    ? "bg-[#1E2638] text-[#94A3B8] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#00D2FF] to-[#2775CA] hover:opacity-95 text-[#0B0E14] active:scale-95 shadow-lg shadow-[#00D2FF]/20"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#94A3B8] border-t-transparent rounded-full animate-spin" />
                    <span>Deploying to {chainConfig.name}...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Deploy ArcTipJar Contract</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
