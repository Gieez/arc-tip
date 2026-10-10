"use client";

import React, { useState } from "react";
import { X, Copy, Check, Globe, Zap } from "lucide-react";

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitch: () => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({
  isOpen,
  onClose,
  onSwitch,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyVal = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const config = [
    { label: "Network Name", value: "Arc Mainnet", key: "name" },
    { label: "RPC URL", value: "https://rpc.mainnet.arc.io", key: "rpc" },
    { label: "Chain ID", value: "5042", sub: "0x13b2", key: "chain" },
    { label: "Currency Symbol", value: "USDC", key: "sym" },
    { label: "Decimals", value: "18", key: "dec" },
    { label: "Block Explorer", value: "https://explorer.arc.io", key: "exp" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#121722] border border-[#1E2638] rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2638] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-[#00D2FF]" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Arc Mainnet Parameters
          </h3>
        </div>
        <p className="text-xs text-[#94A3B8] mb-4">
          Circle&apos;s stablecoin-native Layer 1 EVM. Gas fees and balances are native USDC.
        </p>

        <div className="space-y-2 mb-5">
          {config.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0E14] border border-[#1E2638] text-xs font-mono"
            >
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">
                  {item.label}
                </span>
                <span className="text-white font-medium">{item.value}</span>
                {item.sub && (
                  <span className="text-[#94A3B8] text-[10px] ml-1.5">
                    ({item.sub})
                  </span>
                )}
              </div>
              <button
                onClick={() => copyVal(item.key, item.value)}
                className="p-1 rounded bg-[#182030] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] transition-colors"
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

        <button
          onClick={() => {
            onSwitch();
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-lg bg-[#00D2FF] hover:bg-[#38bdf8] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-[#00D2FF]/20"
        >
          <Zap className="w-4 h-4" />
          <span>Add / Switch to Arc in Wallet</span>
        </button>
      </div>
    </div>
  );
};
