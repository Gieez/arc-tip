export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isRabby?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: {
        method: string;
        params?: unknown[] | Record<string, unknown>;
      }) => Promise<unknown>;
      on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
