"use client";

import React, { useState, useEffect } from "react";
import { formatAddress, formatUsdc, parseUsdc, getTxUrl } from "@/lib/format";
import {
  Send,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Zap,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TipCardProps {
  initialRecipient?: string;
  senderAddress: string | null;
  senderBalance: bigint | null;
  onSendTip: (
    recipient: string,
    amountUsdc: string,
    memo: string,
    useContract: boolean
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

const PRESET_AMOUNTS = ["0.5", "1.0", "2.5", "5.0", "10.0"];

export const TipCard: React.FC<TipCardProps> = ({
  initialRecipient = "",
  senderAddress,
  senderBalance,
  onSendTip,
}) => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState("1.0");
  const [memo, setMemo] = useState("");
  const [useContract, setUseContract] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
    txHash?: string;
  } | null>(null);

  useEffect(() => {
    if (initialRecipient) {
      setRecipient(initialRecipient);
    }
  }, [initialRecipient]);

  const handlePreset = (val: string) => {
    setAmount(val);
    setStatusMessage(null);
  };

  const handleMax = () => {
    if (!senderBalance || senderBalance <= 0n) return;
    // Leave small dust for gas (< 0.002 USDC)
    const reserve = parseUsdc("0.002");
    if (senderBalance > reserve) {
      const maxVal = senderBalance - reserve;
      setAmount(formatUsdc(maxVal, 4).replace(/,/g, ""));
    } else {
      setAmount("0.0");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanRecipient = recipient.trim();
    if (!cleanRecipient.startsWith("0x") || cleanRecipient.length !== 42) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid Arc wallet address (0x...)",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({
        type: "error",
        text: "Tip amount must be greater than 0 USDC",
      });
      return;
    }

    if (!senderAddress) {
      setStatusMessage({
        type: "error",
        text: "Please connect your wallet first",
      });
      return;
    }

    setLoading(true);
    setStatusMessage({
      type: "info",
      text: "Waiting for wallet confirmation on Arc Mainnet...",
    });

    try {
      const res = await onSendTip(cleanRecipient, amount, memo, useContract);
      if (res.success && res.txHash) {
        setStatusMessage({
          type: "success",
          text: `Tip confirmed on Arc Mainnet! Sent ${amount} USDC to ${formatAddress(
            cleanRecipient
          )}`,
          txHash: res.txHash,
        });

        // Trigger confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#00D2FF", "#2775CA", "#10B981", "#ffffff"],
          });
        } catch {
          // ignore
        }

        setMemo("");
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Transaction was rejected or failed on-chain.",
        });
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Unexpected transaction error";
      setStatusMessage({
        type: "error",
        text: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#121722] border border-[#1E2638] rounded-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative hairline accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent opacity-80" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Send Native USDC Tip
            <span className="text-[10px] font-mono font-normal text-[#00D2FF] bg-[#0B0E14] border border-[#1E2638] px-2 py-0.5 rounded">
              Zero Approval
            </span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            1-step native transfer. Gas and settlement paid in USDC on Arc L1.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Address */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-[#94A3B8] tracking-wider">
              Recipient Address
            </label>
            {initialRecipient && (
              <span className="text-[11px] font-mono text-[#00D2FF]">
                Prefilled via Link
              </span>
            )}
          </div>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF] transition-all"
            required
          />
        </div>

        {/* Tip Amount & Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-[#94A3B8] tracking-wider">
              Tip Amount (USDC)
            </label>
            {senderBalance !== null && (
              <button
                type="button"
                onClick={handleMax}
                className="text-[11px] font-mono text-[#00D2FF] hover:underline"
              >
                Max: {formatUsdc(senderBalance)} USDC
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="number"
              step="any"
              min="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg pl-3.5 pr-20 py-3 text-lg font-mono font-semibold text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF] transition-all"
              required
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <span className="text-xs font-bold font-mono text-[#00D2FF]">
                USDC
              </span>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                  amount === preset
                    ? "bg-[#00D2FF]/10 border-[#00D2FF] text-[#00D2FF] font-medium"
                    : "bg-[#0B0E14] border-[#1E2638] text-[#94A3B8] hover:text-white hover:border-[#334155]"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* On-Chain Memo */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-[#94A3B8] tracking-wider flex items-center gap-1.5">
              <span>On-Chain Memo</span>
              <span className="text-[10px] text-[#64748B] normal-case">(optional)</span>
            </label>
            <span className="text-[10px] font-mono text-[#64748B]">
              {memo.length}/280
            </span>
          </div>
          <input
            type="text"
            maxLength={280}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Great work on open source! 🚀"
            className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF] transition-all"
          />
        </div>

        {/* Transfer Mode Toggle */}
        <div className="pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0E14] border border-[#1E2638]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00D2FF]" />
              <div className="text-left">
                <span className="text-xs font-medium text-white block">
                  {useContract ? "ArcTipJar Contract Memo" : "Direct P2P Transfer"}
                </span>
                <span className="text-[10px] text-[#64748B] block font-mono">
                  {useContract
                    ? "Emits on-chain Tip event with public memo"
                    : "Zero-contract native transfer (21k gas)"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseContract(!useContract)}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#182030] text-[#00D2FF] border border-[#1E2638] hover:bg-[#1E2638] transition-colors"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Gas Insight Box */}
        <div className="p-3 rounded-lg bg-[#0B0E14]/60 border border-[#1E2638]/70 flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
          <Info className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-medium">Arc Native Advantage: </span>
            No ERC-20 approve transaction needed. Gas fee (~0.0001 USDC) is deducted
            directly from your USDC balance in the same single block transaction.
          </div>
        </div>

        {/* Status Box */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-red-950/40 border-red-500/40 text-red-300"
                : "bg-cyan-950/40 border-[#00D2FF]/40 text-[#00D2FF]"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#00D2FF] animate-spin" />
            )}
            <div className="space-y-1">
              <div>{statusMessage.text}</div>
              {statusMessage.txHash && (
                <a
                  href={getTxUrl(statusMessage.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-white hover:underline pt-0.5"
                >
                  <span>View on Arc Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            loading
              ? "bg-[#1E2638] text-[#94A3B8] cursor-not-allowed"
              : "bg-gradient-to-r from-[#00D2FF] to-[#2775CA] hover:opacity-95 text-[#0B0E14] font-bold active:scale-[0.99] shadow-lg shadow-[#00D2FF]/20"
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#94A3B8] border-t-transparent rounded-full animate-spin" />
              <span>Broadcasting to Arc...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                Tip {amount} USDC {memo ? "with Memo" : ""}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
