"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createWalletClient,
  custom,
  getAddress,
  parseUnits,
} from "viem";
import {
  arcMainnet,
  botChainMainnet,
  SUPPORTED_CHAINS,
  DEFAULT_CHAIN_ID,
  getChainConfig,
} from "./chains";
import { getPublicClient, getAccountBalance } from "./rpc";
import { ARC_TIP_ABI, getContractAddressForChain } from "./contract";

export function useArcWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number>(DEFAULT_CHAIN_ID);
  const [isConnecting, setIsConnecting] = useState(false);

  const activeChainId = chainId || selectedChainId;
  const currentConfig = getChainConfig(activeChainId);

  // Refresh balance
  const refreshBalance = useCallback(
    async (addr?: string | null, targetChainId?: number) => {
      const target = addr || account;
      if (!target) {
        setBalance(null);
        return;
      }
      const cId = targetChainId || activeChainId;
      const bal = await getAccountBalance(target, cId);
      setBalance(bal);
    },
    [account, activeChainId]
  );

  // Connect Wallet
  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert(
        "No Web3 wallet detected. Please install MetaMask, Rabby, or Coinbase Wallet."
      );
      return;
    }

    try {
      setIsConnecting(true);
      const targetChain =
        selectedChainId === 677 ? botChainMainnet : arcMainnet;

      const walletClient = createWalletClient({
        chain: targetChain,
        transport: custom(window.ethereum),
      });

      const [addr] = await walletClient.requestAddresses();
      if (!addr) return;

      const normalized = getAddress(addr);
      setAccount(normalized);

      // Check current chain ID in wallet
      const currentChainId = await walletClient.getChainId();
      setChainId(currentChainId);

      // If wallet is on a supported chain, sync selectedChainId
      if (SUPPORTED_CHAINS[currentChainId]) {
        setSelectedChainId(currentChainId);
      } else {
        // Switch to target chain
        try {
          await walletClient.switchChain({ id: targetChain.id });
          setChainId(targetChain.id);
          setSelectedChainId(targetChain.id);
        } catch (switchError: unknown) {
          const errCode = (switchError as { code?: number })?.code;
          const errMsg = (switchError as { message?: string })?.message;
          if (errCode === 4902 || errMsg?.includes("Unrecognized chain")) {
            await walletClient.addChain({ chain: targetChain });
            await walletClient.switchChain({ id: targetChain.id });
            setChainId(targetChain.id);
            setSelectedChainId(targetChain.id);
          }
        }
      }

      await refreshBalance(normalized, targetChain.id);
    } catch (err: unknown) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance, selectedChainId]);

  // Switch or Add Network
  const switchNetwork = useCallback(
    async (targetChainId?: number) => {
      if (typeof window === "undefined" || !window.ethereum) return;
      const targetId = targetChainId || selectedChainId;
      const targetChain = targetId === 677 ? botChainMainnet : arcMainnet;

      try {
        const walletClient = createWalletClient({
          chain: targetChain,
          transport: custom(window.ethereum),
        });

        try {
          await walletClient.switchChain({ id: targetChain.id });
          setChainId(targetChain.id);
          setSelectedChainId(targetChain.id);
          if (account) refreshBalance(account, targetChain.id);
        } catch (switchErr: unknown) {
          const errCode = (switchErr as { code?: number })?.code;
          const errMsg = (switchErr as { message?: string })?.message;
          if (errCode === 4902 || errMsg?.includes("Unrecognized chain")) {
            await walletClient.addChain({ chain: targetChain });
            await walletClient.switchChain({ id: targetChain.id });
            setChainId(targetChain.id);
            setSelectedChainId(targetChain.id);
            if (account) refreshBalance(account, targetChain.id);
          }
        }
      } catch (err) {
        console.error("Switch chain error:", err);
      }
    },
    [account, refreshBalance, selectedChainId]
  );

  // Disconnect
  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance(null);
  }, []);

  // Send Tip (Native value transfer or contract call)
  const sendTip = useCallback(
    async (
      recipient: string,
      amountTokens: string,
      memo: string,
      useContract: boolean
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      if (typeof window === "undefined" || !window.ethereum) {
        return { success: false, error: "No wallet provider available" };
      }

      const fromAccount = account;
      if (!fromAccount) {
        await connect();
        return {
          success: false,
          error: "Wallet not connected. Please connect and retry.",
        };
      }

      const targetChain =
        selectedChainId === 677 ? botChainMainnet : arcMainnet;
      const contractAddress = getContractAddressForChain(targetChain.id);

      try {
        const walletClient = createWalletClient({
          chain: targetChain,
          transport: custom(window.ethereum),
        });

        // Ensure wallet is on the right chain
        const activeWalletChain = await walletClient.getChainId();
        if (activeWalletChain !== targetChain.id) {
          await switchNetwork(targetChain.id);
        }

        const valueWei = parseUnits(amountTokens, 18);
        const cleanRecipient = getAddress(recipient);

        let txHash: `0x${string}`;

        if (useContract && contractAddress) {
          // Contract call with on-chain memo
          txHash = await walletClient.writeContract({
            address: contractAddress,
            abi: ARC_TIP_ABI,
            functionName: "tip",
            args: [cleanRecipient, memo || ""],
            value: valueWei,
            account: fromAccount as `0x${string}`,
          });
        } else {
          // Direct native transfer (21k gas)
          txHash = await walletClient.sendTransaction({
            account: fromAccount as `0x${string}`,
            to: cleanRecipient,
            value: valueWei,
          });
        }

        // Wait for 1 confirmation with timeout preservation
        const client = getPublicClient(targetChain.id);
        try {
          const receipt = await client.waitForTransactionReceipt({
            hash: txHash,
            timeout: 25_000,
          });

          refreshBalance(fromAccount, targetChain.id);

          if (receipt.status === "success") {
            return { success: true, txHash };
          } else {
            return {
              success: false,
              txHash,
              error: "Transaction reverted on chain.",
            };
          }
        } catch (waitErr: unknown) {
          console.warn(
            "waitForTransactionReceipt timed out or delayed:",
            waitErr
          );
          // Return success with note so user doesn't double-spend
          return {
            success: true,
            txHash,
            error:
              "Transaction submitted! Confirmation is pending on network.",
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
    [account, connect, refreshBalance, selectedChainId, switchNetwork]
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
        if (SUPPORTED_CHAINS[numChain]) {
          setSelectedChainId(numChain);
        }
        if (account) refreshBalance(account, numChain);
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
          const cId = parseInt(hex, 16);
          setChainId(cId);
          if (SUPPORTED_CHAINS[cId]) {
            setSelectedChainId(cId);
          }
        }
      })
      .catch(() => {});

    return () => {
      window.ethereum?.removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [account, disconnect, refreshBalance]);

  return {
    account,
    balance,
    chainId,
    selectedChainId,
    setSelectedChainId,
    currentConfig,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    sendTip,
    refreshBalance,
  };
}
