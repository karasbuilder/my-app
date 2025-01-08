import { useState, useCallback, useEffect } from "react";
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
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../utils/providers/ProviderWallet";

const StakePage = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [stakeAmount, setStakeAmount] = useState("");
  const [duration, setDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPendingTx, setIsPendingTx] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Contract hooks
  const { writeContractAsync } = useWriteContract();

  // Data fetching hooks
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
  });

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

  const {
    data: pendingReward,
    isLoading: isLoadingReward,
    refetch: refetchReward,
  } = useReadContract({
    address: STAKING_CONTRACT.address,
    abi: STAKING_CONTRACT.abi,
    functionName: "getPendingReward",
    args: [address],
  });

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchEthBalance(), refetchStake(), refetchReward()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
    setIsRefreshing(false);
  }, [refetchEthBalance, refetchStake, refetchReward]);

  const handleTransaction = async (
    action: () => Promise<`0x${string}`>,
    loadingMessage: string,
    successMessage: string
  ) => {
    const toastId = toast.loading(loadingMessage);
    try {
      const tx = await action();
      setIsPendingTx(true);
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      await refreshData();

      toast.update(toastId, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setIsPendingTx(false);
      return true;
    } catch (error: any) {
      toast.update(toastId, {
        render: error?.message || "Transaction failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setIsPendingTx(false);
      return false;
    }
  };

  // Action handlers
  const handleStake = async () => {
    if (
      !stakeAmount ||
      isNaN(Number(stakeAmount)) ||
      Number(stakeAmount) <= 0
    ) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    const success = await handleTransaction(
      () =>
        writeContractAsync({
          abi: STAKING_CONTRACT.abi,
          address: STAKING_CONTRACT.address,
          functionName: "stake",
          value: parseEther(stakeAmount.toString()),
        }),
      "Initiating staking transaction...",
      "Staking successful!"
    );

    if (success) {
      setStakeAmount("");
    }
  };

  const handleUnstake = () =>
    handleTransaction(
      () =>
        writeContractAsync({
          abi: STAKING_CONTRACT.abi,
          address: STAKING_CONTRACT.address,
          functionName: "unstake",
        }),
      "Initiating unstaking transaction...",
      "Unstaking successful!"
    );

  const handleClaim = () =>
    handleTransaction(
      () =>
        writeContractAsync({
          abi: STAKING_CONTRACT.abi,
          address: STAKING_CONTRACT.address,
          functionName: "claimReward",
        }),
      "Initiating reward claim...",
      "Rewards claimed successfully!"
    );

  const handleDisconnect = () => {
    disconnect();
    toast.success("Disconnected successfully");
  };

  const isActionDisabled = isPendingTx || isRefreshing;

  const { data: lastStakeTime, isLoading: isLoadingStakeTime } =
    useReadContract({
      address: STAKING_CONTRACT.address,
      abi: STAKING_CONTRACT.abi,
      functionName: "lastStakeTime",
      args: [address],
    });
  useEffect(() => {
    if (lastStakeTime) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const seconds = now - Number(lastStakeTime);

        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        setDuration({ days, hours, minutes, seconds: secs });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastStakeTime]);
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-6">
      {/* Wallet Section */}
      <div className="border-b pb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Wallet</h2>
          <button
            onClick={refreshData}
            disabled={isActionDisabled}
            className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600">
            Address: <span className="font-mono">{address}</span>
          </p>
          <p className="text-gray-600">
            Balance:{" "}
            {isLoadingStake ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <span className="font-medium">{ethBalance?.formatted} ETH</span>
            )}
          </p>
        </div>

        {/* Staking Input */}
        <div className="flex gap-4 mt-4">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Amount in ETH"
            className="p-3 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isActionDisabled}
          />
          <button
            className="btn-primary min-w-[120px]"
            onClick={handleStake}
            disabled={isActionDisabled}
          >
            {isActionDisabled ? "Processing..." : "Stake"}
          </button>
        </div>
      </div>

      {/* Staking Information */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Staking Information</h2>
        <div className="space-y-4">
          {isLoadingStake ? (
            <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3" />
          ) : (
            <p className="text-gray-600">
              Total Staked:{" "}
              <span className="font-medium">
                {dataStake ? formatEther(dataStake as any) : "0"} ETH
              </span>
            </p>
          )}

          <button
            className="btn-primary w-full"
            disabled={isActionDisabled || !dataStake || (dataStake as any) <= 0}
            onClick={handleUnstake}
          >
            {isActionDisabled ? "Processing..." : "Unstake"}
          </button>
        </div>
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Staking Duration</h3>
          {isLoadingStakeTime ? (
            <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3" />
          ) : (
            <p>
              {`${duration.days}d ${duration.hours}h ${duration.minutes}m
            ${duration.seconds}s`}
            </p>
          )}
        </div>
        {/* Rewards Section */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Rewards</h3>
            <p className="text-gray-600">
              {pendingReward ? formatEther(pendingReward as any) : "0"} $REWARD
            </p>
          </div>

          {!isLoadingReward && (pendingReward as any) > 0 && (
            <button
              className="btn-primary w-full"
              disabled={isActionDisabled}
              onClick={handleClaim}
            >
              {isActionDisabled ? "Processing..." : "Claim Rewards"}
            </button>
          )}
        </div>
      </div>

      {/* Disconnect Button */}
      <div className="border-t pt-6">
        <button
          onClick={handleDisconnect}
          className="bg-red-500 w-full px-4 py-3 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          disabled={isActionDisabled}
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

export default StakePage;
