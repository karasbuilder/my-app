import React, { useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";

const StakePage = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [stakeAmount, setStakeAmount] = useState<number>(0);

  const { data: ethBalance } = useBalance({
    address,
  });
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg flex-col gap-6 flex">
      <div className="border-b pb-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold">Your Wallet</h2>
        <p className="text-gray-600">Address: {address}</p>
        <p className="text-gray-600">Balance: {ethBalance?.formatted} ETH</p>
        <div className="flex gap-5">
          <input
            type="number"
            className="flex-1 border border-black rounded-lg p-2"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Number(e.target.value))}
          />
          <button>Stake</button>
        </div>
        <div>
          <h2 className="text-xl font-bold">Staking</h2>
          <div className="border-b pb-4 flex flex-col gap-2">
            <p className="text-gray-600">Total Staked: 0 ETH </p>
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
