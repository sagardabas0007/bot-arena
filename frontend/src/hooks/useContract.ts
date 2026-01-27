'use client';

import { useCallback } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import toast from 'react-hot-toast';

const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const ARENA_ABI = [
  {
    name: 'joinGame',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'arenaId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'getGameParticipants',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    name: 'getArena',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'arenaId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'entryFee', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'games',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'arenaId', type: 'uint256' },
      { name: 'prizePool', type: 'uint256' },
      { name: 'participantCount', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'winner', type: 'address' },
    ],
  },
] as const;

export function useContract() {
  const { writeContractAsync: writeContract } = useWriteContract();

  const approveUSDC = useCallback(
    async (amount: string): Promise<`0x${string}` | null> => {
      if (!CONTRACT_ADDRESSES.ARENA) {
        toast.error('Arena contract address not configured');
        return null;
      }

      try {
        const amountInWei = parseUnits(amount, 6);
        const hash = await writeContract({
          address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.ARENA as `0x${string}`, amountInWei],
        });
        toast.success('USDC approval submitted!');
        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve USDC';
        toast.error(message);
        return null;
      }
    },
    [writeContract]
  );

  const joinGameOnChain = useCallback(
    async (gameId: number, arenaId: number): Promise<`0x${string}` | null> => {
      if (!CONTRACT_ADDRESSES.ARENA) {
        toast.error('Arena contract address not configured');
        return null;
      }

      try {
        const hash = await writeContract({
          address: CONTRACT_ADDRESSES.ARENA as `0x${string}`,
          abi: ARENA_ABI,
          functionName: 'joinGame',
          args: [BigInt(gameId), BigInt(arenaId)],
        });
        toast.success('Transaction submitted!');
        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join game on-chain';
        toast.error(message);
        return null;
      }
    },
    [writeContract]
  );

  const joinGameWithApproval = useCallback(
    async (gameId: number, arenaId: number, entryFee: string): Promise<`0x${string}` | null> => {
      const approvalHash = await approveUSDC(entryFee);
      if (!approvalHash) return null;

      toast.loading('Waiting for approval confirmation...');

      await new Promise((resolve) => setTimeout(resolve, 5000));

      toast.dismiss();

      const joinHash = await joinGameOnChain(gameId, arenaId);
      return joinHash;
    },
    [approveUSDC, joinGameOnChain]
  );

  return {
    approveUSDC,
    joinGameOnChain,
    joinGameWithApproval,
    USDC_ABI,
    ARENA_ABI,
  };
}

export function useUSDCBalance(address?: string) {
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return balance ? Number(balance) / 1e6 : 0;
}

export function useArenaContract(arenaId?: number) {
  const { data: arenaData } = useReadContract({
    address: CONTRACT_ADDRESSES.ARENA as `0x${string}`,
    abi: ARENA_ABI,
    functionName: 'getArena',
    args: arenaId ? [BigInt(arenaId)] : undefined,
    query: {
      enabled: !!arenaId && !!CONTRACT_ADDRESSES.ARENA,
    },
  });

  return arenaData;
}
