"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { TipCard } from "@/components/TipCard";
import { NetworkModal } from "@/components/NetworkModal";
import { QrModal } from "@/components/QrModal";
import { useArcWallet } from "@/lib/useArcWallet";
import { getRecipientStats, RecipientStats } from "@/lib/rpc";
import { formatAddress, formatUsdc, getAddressUrl } from "@/lib/format";
import { ArrowLeft, ExternalLink, QrCode, User } from "lucide-react";

export default function RecipientTipPage() {
  const params = useParams();
  const router = useRouter();
  const rawAddress = (params?.address as string) || "";

  const {
    account,
    balance,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    sendTip,
    refreshBalance,
  } = useArcWallet();

  const [recipientStats, setRecipientStats] = useState<RecipientStats | null>(
    null
  );
  const [loadingStats, setLoadingStats] = useState(true);

  // Modals
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const cleanRecipient = rawAddress.trim();
  const isValidAddress =
    cleanRecipient.startsWith("0x") && cleanRecipient.length === 42;

  const loadStats = useCallback(async () => {
    if (!isValidAddress) return;
    setLoadingStats(true);
    try {
      const stats = await getRecipientStats(cleanRecipient);
      setRecipientStats(stats);
    } catch (err) {
      console.error("Failed to load recipient stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [cleanRecipient, isValidAddress]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://arc-tip.vercel.app";
  const shareUrl = `${origin}/tip/${cleanRecipient}`;

  const handleSendTip = async (
    recipient: string,
    amountUsdc: string,
    memo: string,
    useContract: boolean
  ) => {
    const res = await sendTip(recipient, amountUsdc, memo, useContract);
    if (res.success) {
      loadStats();
      refreshBalance();
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col font-sans selection:bg-[#00D2FF]/20 selection:text-[#00D2FF]">
      <Header
        account={account}
        balance={balance}
        chainId={chainId}
        onConnect={connect}
        onDisconnect={disconnect}
        onSwitchNetwork={() => setNetworkModalOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Back Link */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-[#00D2FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ArcTip Home</span>
        </button>

        {/* Recipient Profile Header Card */}
        <div className="w-full bg-[#121722] border border-[#1E2638] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D2FF]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {/* Avatar glyph */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D2FF]/20 to-[#2775CA]/30 border border-[#00D2FF]/30 flex items-center justify-center text-white shadow-xl shadow-[#00D2FF]/10">
                <User className="w-8 h-8 text-[#00D2FF]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formatAddress(cleanRecipient)}
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-600/40 text-emerald-400">
                    Arc Recipient
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 font-mono text-xs text-[#94A3B8]">
                  <a
                    href={getAddressUrl(cleanRecipient)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="hover:text-[#00D2FF] flex items-center gap-1 transition-colors"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Show QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recipient Metrics */}
            <div className="flex items-center gap-4 bg-[#0B0E14] border border-[#1E2638] rounded-xl p-3 sm:p-4 text-right">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                  Total Received
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-emerald-400 block mt-0.5">
                  {loadingStats
                    ? "Loading..."
                    : recipientStats
                    ? `${formatUsdc(recipientStats.totalReceived)} USDC`
                    : "0.00 USDC"}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-[#1E2638]" />
              <div>
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                  Tips Count
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-[#00D2FF] block mt-0.5">
                  {loadingStats
                    ? "..."
                    : recipientStats
                    ? recipientStats.tipCount.toString()
                    : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Card */}
        <div className="max-w-xl mx-auto w-full">
          <TipCard
            initialRecipient={cleanRecipient}
            senderAddress={account}
            senderBalance={balance}
            onSendTip={handleSendTip}
          />
        </div>
      </main>

      <footer className="w-full border-t border-[#1E2638] bg-[#0B0E14] py-6 text-xs text-[#94A3B8] text-center">
        <p className="font-mono text-[11px]">
          ArcTip • Native USDC gas and micro-payments on Circle Arc (5042)
        </p>
      </footer>

      <NetworkModal
        isOpen={networkModalOpen}
        onClose={() => setNetworkModalOpen(false)}
        onSwitch={switchNetwork}
      />

      <QrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={shareUrl}
        address={cleanRecipient}
      />
    </div>
  );
}
