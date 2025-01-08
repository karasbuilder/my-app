import { ConnectButton } from "@rainbow-me/rainbowkit";
import StakePage from "./pages/StakePage";
import { useAccount } from "wagmi";

function App() {
  const { address } = useAccount();
  return (
    <div className="h-screen justify-center flex items-center">
      {address ? <StakePage /> : <ConnectButton />}
    </div>
  );
}

export default App;
