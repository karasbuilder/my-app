import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { sepolia } from "viem/chains";
import { cookieToInitialState, http, WagmiProvider } from "wagmi";
interface IProps {
  children: React.ReactNode;
  cookie?: string | null;
}

export const config = getDefaultConfig({
  appName: "Stake App ",
  projectId: String(process.env.REACT_WALLET_ID),
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});
const ProviderWallet = ({ children, cookie }: IProps) => {
  const queryClient = new QueryClient();
  const initialState = cookieToInitialState(config, cookie);
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default ProviderWallet;
