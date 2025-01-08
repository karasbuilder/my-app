import { useState } from "react";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { STAKING_CONTRACT } from "../utils/web3";
import { type UseReadContractParameters } from "wagmi";
import { parseEther } from "viem";
const StakePage = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [stakeAmount, setStakeAmount] = useState("");

  const { data: ethBalance } = useBalance({
    address,
  });
  const { writeContract } = useWriteContract();
  const { data: dataStake, isLoading: isLoadingStake } = useReadContract({
    abi: STAKING_CONTRACT.abi,
    address: STAKING_CONTRACT.address,
    functionName: "stakingBalance",
    args: [address],
  });
  const handleStake = async () => {
    try {
      writeContract({
        abi: STAKING_CONTRACT.abi,
        address: STAKING_CONTRACT.address,
        functionName: "stake",
        value: parseEther(stakeAmount.toString()),
      });
    } catch (error) {
      console.error("Error staking:", error);
    }
  };
  const handleUnstake = async () => {
    try {
      await writeContract({
        abi: STAKING_CONTRACT.abi,
        address: STAKING_CONTRACT.address,
        functionName: "unstake",
      });
    } catch (error) {
      console.error("Error unstaking:", error);
    }
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg flex-col gap-6 flex">
      <div className="border-b pb-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold">Your Wallet</h2>
        <p className="text-gray-600">Address: {address}</p>
        <p className="text-gray-600">Balance: {ethBalance?.formatted} ETH</p>
        <div className="flex gap-5">
          <input
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Amount in ETH"
            className="p-2 border rounded"
          />
          <button className="btn-primary" onClick={async () => handleStake()}>
            Stake
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold">Staking</h2>
          <div className="border-b pb-4 flex flex-col gap-2">
            <p className="text-gray-600">
              Total Staked:{" "}
              {isLoadingStake ? "Loading..." : (dataStake as number).toString()}{" "}
              ETH{" "}
            </p>
            <button className="btn-primary">Unstake</button>
          </div>
        </div>
        <div className="flex justify-between">
          <p>Staking Duration</p>
          <p>3days</p>
        </div>
        <div>
          <p>Staking Reward</p>
          <div className="flex justify-between">
            <p>0.1 $REWARD</p>
            <button className="btn-primary">Claim</button>
          </div>
        </div>
      </div>
      <button onClick={() => disconnect()}>Lougout</button>
    </div>
  );
};

export default StakePage;
