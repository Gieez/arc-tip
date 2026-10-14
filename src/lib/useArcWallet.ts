"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createWalletClient,
  custom,
  getAddress,
  parseUnits,
} from "viem";
import { arcMainnet } from "./arcChain";
import { publicClient, getAccountBalance } from "./rpc";
import { ARC_TIP_CONTRACT_ADDRESS, ARC_TIP_ABI } from "./contract";

export function useArcWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Refresh balance
  const refreshBalance = useCallback(async (addr?: string) => {
    const target = addr || account;
    if (!target) {
      setBalance(null);
      return;
    }
    const bal = await getAccountBalance(target);
    setBalance(bal);
  }, [account]);

  // Connect Wallet
  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("No Web3 wallet detected. Please install MetaMask, Rabby, or Coinbase Wallet.");
      return;
    }

    try {
      setIsConnecting(true);
      const walletClient = createWalletClient({
        chain: arcMainnet,
        transport: custom(window.ethereum),
      });

      const [addr] = await walletClient.requestAddresses();
      if (!addr) return;

      const normalized = getAddress(addr);
      setAccount(normalized);

      // Check chain ID
      const currentChainId = await walletClient.getChainId();
      setChainId(currentChainId);

      // If not on Arc, try switching
      if (currentChainId !== arcMainnet.id) {
        try {
          await walletClient.switchChain({ id: arcMainnet.id });
          setChainId(arcMainnet.id);
        } catch (switchError: unknown) {
          const errCode = (switchError as { code?: number })?.code;
          const errMsg = (switchError as { message?: string })?.message;
          if (errCode === 4902 || errMsg?.includes("Unrecognized chain")) {
            await walletClient.addChain({ chain: arcMainnet });
            await walletClient.switchChain({ id: arcMainnet.id });
            setChainId(arcMainnet.id);
          }
        }
      }

      await refreshBalance(normalized);
    } catch (err: unknown) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  // Switch or Add Arc Network
  const switchNetwork = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      const walletClient = createWalletClient({
        chain: arcMainnet,
        transport: custom(window.ethereum),
      });
      try {
        await walletClient.switchChain({ id: arcMainnet.id });
        setChainId(arcMainnet.id);
      } catch {
        await walletClient.addChain({ chain: arcMainnet });
        await walletClient.switchChain({ id: arcMainnet.id });
        setChainId(arcMainnet.id);
      }
    } catch (err) {
      console.error("Switch chain error:", err);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance(null);
  }, []);

  // Send Tip
  const sendTip = useCallback(
    async (
      recipient: string,
      amountUsdc: string,
      memo: string,
      useContract: boolean
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      if (typeof window === "undefined" || !window.ethereum) {
        return { success: false, error: "No wallet provider available" };
      }

      const fromAccount = account;
      if (!fromAccount) {
        await connect();
        return { success: false, error: "Wallet not connected. Please connect and retry." };
      }

      try {
        const walletClient = createWalletClient({
          chain: arcMainnet,
          transport: custom(window.ethereum),
        });

        // Ensure right chain
        const activeChain = await walletClient.getChainId();
        if (activeChain !== arcMainnet.id) {
          await switchNetwork();
        }

        const valueWei = parseUnits(amountUsdc, 18);
        const cleanRecipient = getAddress(recipient);

        let txHash: `0x${string}`;

        if (useContract) {
          // ArcTipJar contract call
          txHash = await walletClient.writeContract({
            address: ARC_TIP_CONTRACT_ADDRESS,
            abi: ARC_TIP_ABI,
            functionName: "tip",
            args: [cleanRecipient, memo || ""],
            value: valueWei,
            account: fromAccount as `0x${string}`,
          });
        } else {
          // Direct native USDC transfer (21k gas)
          txHash = await walletClient.sendTransaction({
            account: fromAccount as `0x${string}`,
            to: cleanRecipient,
            value: valueWei,
          });
        }

        // Wait for 1 confirmation with timeout preservation
        let receipt;
        try {
          receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            timeout: 25_000,
          });
        } catch (waitErr: unknown) {
          console.warn("waitForTransactionReceipt timed out or delayed:", waitErr);
          // Return success with note so user doesn't double-spend
          return {
            success: true,
            txHash,
            error: "Transaction submitted! Confirmation is pending on network.",
          };
        }

        // Refresh sender balance
        refreshBalance(fromAccount);

        if (receipt.status === "success") {
          return { success: true, txHash };
        } else {
          return {
            success: false,
            txHash,
            error: "Transaction reverted on chain.",
          };
        }
      } catch (err: unknown) {
        console.error("sendTip error:", err);
        const e = err as { shortMessage?: string; message?: string };
        const errMsg =
          e?.shortMessage || e?.message || "User denied or transaction failed";
        return { success: false, error: errMsg };
      }
    },
    [account, connect, refreshBalance, switchNetwork]
  );

  // Listen to accountsChanged and chainChanged
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined;
      if (accounts && accounts.length > 0) {
        const normalized = getAddress(accounts[0]);
        setAccount(normalized);
        refreshBalance(normalized);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const hexChain = args[0] as string | undefined;
      if (hexChain) {
        const numChain = parseInt(hexChain, 16);
        setChainId(numChain);
        if (account) refreshBalance(account);
      }
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    // Initial silent check
    window.ethereum
      .request?.({ method: "eth_accounts" })
      .then((res: unknown) => {
        const accs = res as string[] | undefined;
        if (accs && accs.length > 0) {
          const normalized = getAddress(accs[0]);
          setAccount(normalized);
          refreshBalance(normalized);
        }
      })
      .catch(() => {});

    window.ethereum
      .request?.({ method: "eth_chainId" })
      .then((res: unknown) => {
        const hex = res as string | undefined;
        if (hex) {
          setChainId(parseInt(hex, 16));
        }
      })
      .catch(() => {});

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [account, disconnect, refreshBalance]);

  return {
    account,
    balance,
    chainId,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    sendTip,
    refreshBalance,
  };
}
