import { useState } from "react";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "react-toastify";
import { STAKING_CONTRACT } from "../utils/web3";

import { parseEther } from "viem";
import { formatEther } from "ethers";
import { waitForTransactionReceipt } from "viem/actions";
import { config } from "../utils/providers/ProviderWallet";

const StakePage = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [stakeAmount, setStakeAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const { isLoading: isTransactionPending } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
  });
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
  });
  const { writeContract, writeContractAsync } = useWriteContract();
  const {
    data: dataStake,
    isLoading: isLoadingStake,
    refetch: refetchStake,
  } = useReadContract({
    abi: STAKING_CONTRACT.abi,
    address: STAKING_CONTRACT.address,
    functionName: "stakingBalance",
    args: [address],
  });
  const { data: pendingReward, isLoading: isLoadingReward } = useReadContract({
    address: STAKING_CONTRACT.address,
    abi: STAKING_CONTRACT.abi,
    functionName: "getPendingReward",
    args: [address],
  });

  const handleStake = async () => {
    if (
      !stakeAmount ||
      isNaN(Number(stakeAmount)) ||
      Number(stakeAmount) <= 0
    ) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    const toastId = toast.loading("Initiating staking transaction...");
    try {
      const tx = await writeContractAsync({
        abi: STAKING_CONTRACT.abi,
        address: STAKING_CONTRACT.address,
        functionName: "stake",
        value: parseEther(stakeAmount.toString()),
      });
      setTransactionHash(tx);
      toast.update(toastId, {
        render: "Staking transaction submitted...",
        type: "info",
        isLoading: true,
      });

      await waitForTransactionReceipt(config as any, {
        hash: tx,
      });
      refetchStake();
      refetchEthBalance();
      toast.update(toastId, {
        render: "Staking successful!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      setStakeAmount("");
    } catch (error: any) {
      toast.update(toastId, {
        render: error?.message || "Staking failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };
  const handleUnstake = async () => {
    const toastId = toast.loading("Initiating unstaking transaction...");
    try {
      const tx = await writeContractAsync({
        abi: STAKING_CONTRACT.abi,
        address: STAKING_CONTRACT.address,
        functionName: "unstake",
      });
      setTransactionHash(tx);
      toast.update(toastId, {
        render: "Staking transaction submitted...",
        type: "info",
        isLoading: true,
      });

      await waitForTransactionReceipt(config as any, {
        hash: tx,
      });
      refetchStake();
      refetchEthBalance();
    } catch (error: any) {
      toast.update(toastId, {
        render: error?.message || "Unstaking Failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };
  const handleClaim = async () => {
    const toastId = toast.loading("Initiating reward claim...");

    try {
      const tx = await writeContractAsync({
        abi: STAKING_CONTRACT.abi,
        address: STAKING_CONTRACT.address,
        functionName: "claimReward",
      });
      setTransactionHash(tx);
      toast.update(toastId, {
        render: "Claiming reward...",
        type: "info",
        isLoading: true,
      });
      await waitForTransactionReceipt(config as any, {
        hash: tx,
      });

      toast.update(toastId, {
        render: "Reward claimed!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      refetchStake();
      refetchEthBalance();
    } catch (error: any) {
      toast.update(toastId, {
        render: error?.message || "Reward claim failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  //   useEffect(() => {
  //     if (isTransactionPending && isSuccess) {
  //       toast.success("Transaction successful");
  //       refetchStake();
  //       refetchEthBalance();
  //     }
  //   }, [isTransactionPending, isSuccess]);
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
          <button
            className="btn-primary"
            onClick={async () => await handleStake()}
            disabled={isTransactionPending}
          >
            {isTransactionPending ? "Processing..." : "Stake"}
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold">Staking</h2>
          <div className="border-b pb-4 flex flex-col gap-2">
            <p className="text-gray-600">
              {`Total Staked: ${
                dataStake ? formatEther(dataStake as any) : "0"
              } ETH`}
            </p>
            <button
              className={`btn-primary ${
                isTransactionPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isTransactionPending}
              onClick={async () => handleUnstake()}
            >
              {isTransactionPending ? "Processing..." : "Unstake"}
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <p>Staking Duration</p>
          <p>3days</p>
        </div>
        <div>
          <p>Staking Reward</p>
          <div className="flex justify-between">
            <p>
              {pendingReward ? formatEther(pendingReward as any) : "0"} $REWARD
            </p>
            {!isLoadingReward && (pendingReward as any) !== 0 && (
              <button
                className={`btn-primary ${
                  isTransactionPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isTransactionPending}
                onClick={async () => await handleClaim()}
              >
                {isTransactionPending ? "Processing..." : "Claim"}
              </button>
            )}
          </div>
        </div>
      </div>
      <button onClick={() => disconnect()}>Log Out</button>
    </div>
  );
};

export default StakePage;
