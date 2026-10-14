"use client";

import React, { useState } from "react";
import { X, Copy, Check, Globe, Zap } from "lucide-react";
import { SUPPORTED_CHAINS } from "@/lib/chains";

interface NetworkModalProps {
  isOpen: boolean;
  activeChainId: number;
  onClose: () => void;
  onSwitch: (chainId: number) => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({
  isOpen,
  activeChainId,
  onClose,
  onSwitch,
}) => {
  const [selectedChain, setSelectedChain] = useState<number>(activeChainId || 5042);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const current = SUPPORTED_CHAINS[selectedChain] || SUPPORTED_CHAINS[5042];

  const copyVal = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hexChainId = `0x${current.chain.id.toString(16)}`;

  const config = [
    { label: "Network Name", value: current.name, key: "name" },
    { label: "RPC URL", value: current.rpcUrl, key: "rpc" },
    { label: "Chain ID", value: current.chain.id.toString(), sub: hexChainId, key: "chain" },
    { label: "Currency Symbol", value: current.symbol, key: "sym" },
    { label: "Decimals", value: current.decimals.toString(), key: "dec" },
    { label: "Block Explorer", value: current.explorerUrl, key: "exp" },
    {
      label: "Contract Status",
      value: current.contractAddress ? current.contractAddress : "Pending Gas Faucet (Direct P2P Ready)",
      sub: current.contractAddress ? "Verified ArcTipJar" : "Direct native tip active",
      key: "contract",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#121722] border border-[#1E2638] rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2638] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-[#00D2FF]" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Select & Configure Network
          </h3>
        </div>
        <p className="text-xs text-[#94A3B8] mb-4">
          ArcTip supports high-throughput EVM networks with frictionless native gas micro-payments.
        </p>

        {/* Network Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0E14] rounded-xl border border-[#1E2638] mb-4">
          {Object.values(SUPPORTED_CHAINS).map((chain) => {
            const isSelected = selectedChain === chain.chain.id;
            return (
              <button
                key={chain.chain.id}
                onClick={() => setSelectedChain(chain.chain.id)}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? "bg-[#182030] border border-[#00D2FF]/40 text-white shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#121722]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? "bg-[#00D2FF] animate-pulse" : "bg-[#64748B]"
                  }`}
                />
                <span>{chain.shortName} ({chain.chain.id})</span>
              </button>
            );
          })}
        </div>

        {/* Parameters List */}
        <div className="space-y-2 mb-5 max-h-[300px] overflow-y-auto pr-1">
          {config.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0E14] border border-[#1E2638] text-xs font-mono"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[#64748B] block text-[10px] uppercase">
                  {item.label}
                </span>
                <span className="text-white font-medium break-all">{item.value}</span>
                {item.sub && (
                  <span className="text-[#94A3B8] text-[10px] ml-1.5">
                    ({item.sub})
                  </span>
                )}
              </div>
              <button
                onClick={() => copyVal(item.key, item.value)}
                className="p-1 rounded bg-[#182030] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] transition-colors shrink-0"
                title="Copy value"
              >
                {copiedKey === item.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Switch Button */}
        <button
          onClick={() => {
            onSwitch(selectedChain);
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-lg bg-[#00D2FF] hover:bg-[#38bdf8] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-[#00D2FF]/20"
        >
          <Zap className="w-4 h-4" />
          <span>Switch Wallet to {current.name}</span>
        </button>
      </div>
    </div>
  );
};
