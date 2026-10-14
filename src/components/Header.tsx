"use client";

import React from "react";
import { formatAddress, formatUsdc } from "@/lib/format";
import { getChainConfig, SUPPORTED_CHAINS } from "@/lib/chains";
import { Wallet, ChevronDown } from "lucide-react";

interface HeaderProps {
  account: string | null;
  balance: bigint | null;
  chainId: number | null;
  selectedChainId?: number;
  onConnect: () => void;
  onDisconnect: () => void;
  onOpenNetworkModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  balance,
  chainId,
  selectedChainId = 5042,
  onConnect,
  onDisconnect,
  onOpenNetworkModal,
}) => {
  const activeChainId = chainId || selectedChainId;
  const currentConfig = getChainConfig(activeChainId);
  const isChainSupported = !!SUPPORTED_CHAINS[activeChainId];
  const isMatchingWallet = chainId === activeChainId;

  return (
    <header className="w-full border-b border-[#1E2638] bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00D2FF] to-[#2775CA] flex items-center justify-center shadow-lg shadow-[#00D2FF]/20">
            <span className="text-[#0B0E14] font-black text-lg tracking-tighter">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">ArcTip</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121722] border border-[#1E2638] text-[#00D2FF]">
                {currentConfig.shortName}
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] font-mono">
              Multi-Chain • Gas is {currentConfig.symbol}
            </p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network Switcher Button */}
          <button
            onClick={onOpenNetworkModal}
            title="Click to view network details or switch chain"
            className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
              isMatchingWallet && isChainSupported
                ? "bg-[#121722] border-[#1E2638] text-white hover:border-[#00D2FF]/50"
                : "bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/50"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMatchingWallet && isChainSupported
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="hidden sm:inline">{currentConfig.name}</span>
            <span className="sm:hidden">{currentConfig.symbol}</span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </button>

          {/* Wallet State */}
          {account ? (
            <div className="flex items-center gap-2 bg-[#121722] border border-[#1E2638] rounded-lg p-1 pl-3">
              <div className="flex flex-col items-end pr-1 text-right">
                <span className="text-xs font-mono font-medium text-white">
                  {formatUsdc(balance)}{" "}
                  <span className="text-[#00D2FF]">{currentConfig.symbol}</span>
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {formatAddress(account)}
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="px-2 py-1 text-xs rounded bg-[#182030] hover:bg-red-950/40 hover:text-red-400 text-[#94A3B8] transition-colors border border-transparent hover:border-red-900/40"
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center gap-2 bg-[#00D2FF] hover:bg-[#38bdf8] text-[#0B0E14] font-semibold text-xs px-4 py-2 rounded-lg transition-all active:scale-95 shadow-md shadow-[#00D2FF]/20"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
