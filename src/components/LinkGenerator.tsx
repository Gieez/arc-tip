"use client";

import React, { useState } from "react";
import { formatAddress } from "@/lib/format";
import { Copy, Check, QrCode, Share2 } from "lucide-react";

interface LinkGeneratorProps {
  currentAccount: string | null;
  onOpenQr: (url: string, address: string) => void;
}

export const LinkGenerator: React.FC<LinkGeneratorProps> = ({
  currentAccount,
  onOpenQr,
}) => {
  const [addressInput, setAddressInput] = useState("");
  const [copied, setCopied] = useState(false);

  const activeAddress = addressInput.trim() || currentAccount || "";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://arc-tip-phi.vercel.app";
  const shareUrl = activeAddress ? `${origin}/tip/${activeAddress}` : "";

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseMyAddress = () => {
    if (currentAccount) {
      setAddressInput(currentAccount);
    }
  };

  return (
    <div className="w-full bg-[#121722] border border-[#1E2638] rounded-xl p-5 sm:p-6 shadow-xl relative">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4 text-[#00D2FF]" />
        <h3 className="text-base font-bold text-white tracking-tight">
          Create Your Personal Tip Link
        </h3>
      </div>
      <p className="text-xs text-[#94A3B8] mb-4">
        Share with supporters, add to your GitHub README, X bio, or freelance invoices.
      </p>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-[#94A3B8]">
              Your Arc Wallet Address
            </label>
            {currentAccount && !addressInput && (
              <button
                type="button"
                onClick={handleUseMyAddress}
                className="text-[11px] font-mono text-[#00D2FF] hover:underline"
              >
                Use Connected Wallet
              </button>
            )}
          </div>
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder={currentAccount || "0xYourWalletAddress..."}
            className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF]"
          />
        </div>

        {activeAddress && (
          <div className="p-3 bg-[#0B0E14] border border-[#1E2638] rounded-lg space-y-2">
            <div className="text-[11px] font-mono text-[#94A3B8] flex items-center justify-between">
              <span>Shareable URL:</span>
              <span className="text-[#00D2FF]">{formatAddress(activeAddress)}</span>
            </div>
            <div className="text-xs font-mono text-white break-all bg-[#121722] p-2 rounded border border-[#1E2638]">
              {shareUrl}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#182030] hover:bg-[#1E2638] text-xs font-medium text-white transition-all border border-[#1E2638]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenQr(shareUrl, activeAddress)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#182030] hover:bg-[#1E2638] text-xs font-medium text-white transition-all border border-[#1E2638]"
              >
                <QrCode className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Show QR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
