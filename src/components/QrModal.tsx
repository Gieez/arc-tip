"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { formatAddress } from "@/lib/format";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  address: string;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  url,
  address,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#121722] border border-[#1E2638] rounded-2xl p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2638] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-1">Scan to Tip via Mobile</h3>
        <p className="text-xs text-[#94A3B8] font-mono mb-4">
          Recipient: {formatAddress(address)}
        </p>

        {/* QR Code Container */}
        <div className="mx-auto w-56 h-56 bg-white p-4 rounded-xl flex items-center justify-center shadow-inner mb-4">
          <QRCodeSVG
            value={url}
            size={192}
            level="M"
            includeMargin={false}
            fgColor="#0B0E14"
            bgColor="#ffffff"
          />
        </div>

        <div className="text-xs font-mono text-[#94A3B8] break-all bg-[#0B0E14] p-2.5 rounded-lg border border-[#1E2638] mb-4">
          {url}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#00D2FF] hover:bg-[#38bdf8] text-[#0B0E14] text-xs font-bold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg bg-[#182030] text-white hover:bg-[#1E2638] transition-colors border border-[#1E2638]"
            title="Open link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
