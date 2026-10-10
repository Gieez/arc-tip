"use client";

import React from "react";
import { formatAddress, formatUsdc, getTxUrl, getAddressUrl } from "@/lib/format";
import { TipEvent, ArcNetworkStats } from "@/lib/rpc";
import { ARC_TIP_CONTRACT_ADDRESS } from "@/lib/contract";
import {
  Activity,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Box,
} from "lucide-react";

interface ActivityFeedProps {
  stats: ArcNetworkStats | null;
  totalTipsCount: bigint | null;
  tips: TipEvent[];
  loading: boolean;
  onRefresh: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  stats,
  totalTipsCount,
  tips,
  loading,
  onRefresh,
}) => {
  return (
    <div className="w-full bg-[#121722] border border-[#1E2638] rounded-xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Network Stats Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00D2FF]" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Arc Network Metrics
            </h3>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh network data"
            className="p-1.5 rounded-lg bg-[#0B0E14] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] transition-all border border-[#1E2638]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-[#0B0E14] rounded-lg border border-[#1E2638]">
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
              Chain ID
            </span>
            <span className="text-sm font-mono font-bold text-white block mt-0.5">
              5042
            </span>
            <span className="text-[9px] font-mono text-[#00D2FF]">0x13b2 (Arc)</span>
          </div>

          <div className="p-3 bg-[#0B0E14] rounded-lg border border-[#1E2638]">
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
              Latest Block
            </span>
            <span className="text-sm font-mono font-bold text-white block mt-0.5">
              {stats?.blockNumber ? stats.blockNumber.toLocaleString() : "—"}
            </span>
            <span className="text-[9px] font-mono text-emerald-400">Sub-second</span>
          </div>

          <div className="p-3 bg-[#0B0E14] rounded-lg border border-[#1E2638]">
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
              Gas Asset
            </span>
            <span className="text-sm font-mono font-bold text-white block mt-0.5">
              USDC
            </span>
            <span className="text-[9px] font-mono text-[#94A3B8]">
              {stats?.gasPriceGwei ? `${stats.gasPriceGwei} Gwei` : "—"}
            </span>
          </div>

          <div className="p-3 bg-[#0B0E14] rounded-lg border border-[#1E2638]">
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
              Total Tips
            </span>
            <span className="text-sm font-mono font-bold text-[#00D2FF] block mt-0.5">
              {totalTipsCount !== null ? totalTipsCount.toString() : "—"}
            </span>
            <span className="text-[9px] font-mono text-[#94A3B8]">On-chain count</span>
          </div>
        </div>
      </div>

      {/* Contract Verification Link */}
      <div className="p-3 bg-[#0B0E14] border border-[#1E2638] rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <span className="text-xs text-white font-medium block">
              ArcTipJar Mainnet Contract
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              {formatAddress(ARC_TIP_CONTRACT_ADDRESS)}
            </span>
          </div>
        </div>
        <a
          href={getAddressUrl(ARC_TIP_CONTRACT_ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-[#00D2FF] hover:underline flex items-center gap-1"
        >
          <span>Explorer</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Recent Activity List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase text-[#94A3B8] tracking-wider">
            Live On-Chain Feed
          </h4>
          <span className="text-[10px] font-mono text-[#64748B]">
            {tips.length} {tips.length === 1 ? "record" : "records"}
          </span>
        </div>

        {tips.length === 0 ? (
          <div className="text-center py-8 bg-[#0B0E14] border border-[#1E2638] rounded-lg">
            <Box className="w-8 h-8 text-[#334155] mx-auto mb-2" />
            <p className="text-xs text-[#94A3B8] font-mono">
              No recent tips in block range.
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Be the first to send a tip and stamp an on-chain memo!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {tips.map((t, idx) => (
              <div
                key={t.txHash || idx}
                className="p-3 bg-[#0B0E14] border border-[#1E2638] hover:border-[#2775CA]/60 rounded-lg transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-[#94A3B8]">{formatAddress(t.from)}</span>
                    <span className="text-[#64748B]">→</span>
                    <span className="text-[#00D2FF] font-medium">
                      {formatAddress(t.to)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{formatUsdc(t.amount)} USDC
                    </span>
                  </div>
                </div>

                {t.memo && (
                  <div className="flex items-start gap-1.5 text-xs text-[#CBD5E1] bg-[#121722] p-2 rounded border border-[#1E2638]/60 my-1.5 font-sans">
                    <MessageSquare className="w-3.5 h-3.5 text-[#00D2FF] shrink-0 mt-0.5" />
                    <span className="break-words italic">&quot;{t.memo}&quot;</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1 border-t border-[#1E2638]/40">
                  <span>Block #{t.blockNumber ? t.blockNumber.toString() : "—"}</span>
                  {t.txHash && (
                    <a
                      href={getTxUrl(t.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#94A3B8] hover:text-[#00D2FF] flex items-center gap-1 transition-colors"
                    >
                      <span>Tx</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
