"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { TipCard } from "@/components/TipCard";
import { LinkGenerator } from "@/components/LinkGenerator";
import { ActivityFeed } from "@/components/ActivityFeed";
import { NetworkModal } from "@/components/NetworkModal";
import { QrModal } from "@/components/QrModal";
import { useArcWallet } from "@/lib/useArcWallet";
import {
  getArcNetworkStats,
  getGlobalTotalTips,
  getRecentTips,
  ArcNetworkStats,
  TipEvent,
} from "@/lib/rpc";
import { Zap, Shield, ExternalLink, Code2 } from "lucide-react";

export default function Home() {
  const {
    account,
    balance,
    chainId,
    selectedChainId,
    setSelectedChainId,
    currentConfig,
    connect,
    disconnect,
    switchNetwork,
    sendTip,
    refreshBalance,
  } = useArcWallet();

  const [stats, setStats] = useState<ArcNetworkStats | null>(null);
  const [totalTipsCount, setTotalTipsCount] = useState<bigint | null>(null);
  const [tips, setTips] = useState<TipEvent[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Modals
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<{ url: string; address: string }>({
    url: "",
    address: "",
  });

  const loadNetworkData = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const [netStats, totalTips, recentTips] = await Promise.all([
        getArcNetworkStats(selectedChainId),
        getGlobalTotalTips(selectedChainId),
        getRecentTips(selectedChainId, 10),
      ]);
      setStats(netStats);
      setTotalTipsCount(totalTips);

      // Merge with any local session tips stored in localStorage
      let localSessionTips: TipEvent[] = [];
      try {
        const stored = localStorage.getItem(`arc_tip_history_${selectedChainId}`);
        if (stored) {
          localSessionTips = JSON.parse(stored);
        }
      } catch {
        // ignore
      }

      // Deduplicate by txHash
      const seen = new Set<string>();
      const combined: TipEvent[] = [];

      for (const t of [...localSessionTips, ...recentTips]) {
        if (!seen.has(t.txHash.toLowerCase())) {
          seen.add(t.txHash.toLowerCase());
          combined.push(t);
        }
      }

      setTips(combined.slice(0, 15));
    } catch (err) {
      console.error("Error loading network data:", err);
    } finally {
      setLoadingFeed(false);
    }
  }, [selectedChainId]);

  useEffect(() => {
    loadNetworkData();
    const interval = setInterval(loadNetworkData, 15_000);
    return () => clearInterval(interval);
  }, [loadNetworkData]);

  const handleOpenQr = (url: string, address: string) => {
    setQrData({ url, address });
    setQrModalOpen(true);
  };

  const handleSendTip = async (
    recipient: string,
    amountTokens: string,
    memo: string,
    useContract: boolean
  ) => {
    const res = await sendTip(recipient, amountTokens, memo, useContract);
    if (res.success && res.txHash && account) {
      // Store in local history for immediate responsive feed feedback
      const newTip: TipEvent = {
        from: account,
        to: recipient,
        amount: BigInt(Math.floor(parseFloat(amountTokens) * 1e18)),
        memo,
        txHash: res.txHash,
        blockNumber: stats?.blockNumber || 0n,
        timestamp: Date.now(),
        chainId: selectedChainId,
      };

      try {
        const key = `arc_tip_history_${selectedChainId}`;
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const updated = [newTip, ...existing].slice(0, 20);
        localStorage.setItem(
          key,
          JSON.stringify(updated, (k, v) =>
            typeof v === "bigint" ? v.toString() : v
          )
        );
      } catch {
        // ignore
      }

      // Refresh feed
      loadNetworkData();
      refreshBalance(account, selectedChainId);
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col font-sans selection:bg-[#00D2FF]/20 selection:text-[#00D2FF]">
      {/* Global Navigation Header */}
      <Header
        account={account}
        balance={balance}
        chainId={chainId}
        selectedChainId={selectedChainId}
        onConnect={connect}
        onDisconnect={disconnect}
        onOpenNetworkModal={() => setNetworkModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121722] border border-[#1E2638] text-xs font-mono text-[#00D2FF]">
            <Zap className="w-3.5 h-3.5" />
            <span>
              {currentConfig.name} • Chain ID {currentConfig.chain.id}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Native {currentConfig.symbol} Tipping & Payment Links
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            On {currentConfig.shortName}, gas is paid in{" "}
            <span className="text-white font-semibold">
              {currentConfig.symbol}
            </span>
            . Send non-custodial tips and micro-payments in 1 step with zero
            ERC-20 approvals, sub-second finality, and sub-cent fees.
          </p>

          {/* Value Props Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-[#121722]/80 border border-[#1E2638]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Zero Approvals
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Native value transfer via msg.value. No approve() allowance tx needed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121722]/80 border border-[#1E2638]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Native {currentConfig.symbol}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Gas and payment both settled natively in the same network token.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121722]/80 border border-[#1E2638]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2775CA]" />
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Sub-Second Speed
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Instant transaction inclusion with verifiable on-chain memos.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Interactive Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tipping & Link Creation */}
          <div className="lg:col-span-7 space-y-6">
            <TipCard
              senderAddress={account}
              senderBalance={balance}
              chainId={selectedChainId}
              onSendTip={handleSendTip}
            />

            <LinkGenerator
              currentAccount={account}
              onOpenQr={handleOpenQr}
            />
          </div>

          {/* Right Column: Live Feed & Network Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <ActivityFeed
              stats={stats}
              totalTipsCount={totalTipsCount}
              tips={tips}
              loading={loadingFeed}
              chainId={selectedChainId}
              onRefresh={loadNetworkData}
            />

            {/* Multi-Chain Architecture Explanation Card */}
            <div className="p-5 rounded-xl bg-[#121722] border border-[#1E2638] text-xs space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00D2FF]" />
                Multi-Chain Non-Custodial Architecture
              </h4>
              <p className="text-[#94A3B8] leading-relaxed">
                ArcTip is architected for both Circle Arc L1 (5042) and BOT Chain Mainnet (677).
                Value flows directly peer-to-peer into recipient wallets with zero intermediary custody.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#1E2638] text-[11px] font-mono">
                <span className="text-[#64748B]">Active: {currentConfig.name}</span>
                <a
                  href={currentConfig.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00D2FF] hover:underline flex items-center gap-1"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#1E2638] bg-[#0B0E14] py-8 text-xs text-[#94A3B8]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-tight">ArcTip</span>
            <span className="text-[#475569]">•</span>
            <span>Circle Arc (5042) & BOT Chain (677)</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <a
              href="https://github.com/Gieez/arc-tip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>
            {currentConfig.contractAddress && (
              <a
                href={`${currentConfig.explorerUrl}/address/${currentConfig.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Contract</span>
              </a>
            )}
            <button
              onClick={() => setNetworkModalOpen(true)}
              className="hover:text-[#00D2FF] transition-colors"
            >
              Network Switcher
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NetworkModal
        isOpen={networkModalOpen}
        activeChainId={selectedChainId}
        onClose={() => setNetworkModalOpen(false)}
        onSwitch={(targetChainId) => {
          setSelectedChainId(targetChainId);
          switchNetwork(targetChainId);
        }}
      />

      <QrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={qrData.url}
        address={qrData.address}
      />
    </div>
  );
}
