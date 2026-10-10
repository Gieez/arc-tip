import { formatUnits, parseUnits } from "viem";

export function formatAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatUsdc(
  amountWei: bigint | string | number | null | undefined,
  decimals: number = 4
): string {
  if (amountWei === null || amountWei === undefined) return "0.00";
  try {
    const rawBigInt = typeof amountWei === "bigint" ? amountWei : BigInt(amountWei);
    const formatted = formatUnits(rawBigInt, 18);
    const num = parseFloat(formatted);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  } catch {
    return "0.00";
  }
}

export function parseUsdc(amountStr: string): bigint {
  try {
    const sanitized = amountStr.trim().replace(/,/g, "");
    if (!sanitized || isNaN(Number(sanitized))) return 0n;
    return parseUnits(sanitized, 18);
  } catch {
    return 0n;
  }
}

export function getTxUrl(hash: string): string {
  return `https://explorer.arc.io/tx/${hash}`;
}

export function getAddressUrl(address: string): string {
  return `https://explorer.arc.io/address/${address}`;
}

export function getBlockUrl(blockNumber: number | bigint): string {
  return `https://explorer.arc.io/block/${blockNumber}`;
}
