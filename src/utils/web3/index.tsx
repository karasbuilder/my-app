import TOKEN_ABI from "./abis/Erc20Token.json";
import { STAKING_ABI } from "./abis/Staking";

export const TOKEN_CONTRACT = {
  address: "0x099c0EBa98713231f2585F1dD7DCB01e6a1e0DD1" as any,
  abi: TOKEN_ABI,
};

export const STAKING_CONTRACT = {
  address: "0x73EC97F9b3694e230FEe46c8309fef2d753cE1b1" as any,
  abi: STAKING_ABI,
};
