'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const SwapPage = () => {
  const { publicKey, signTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputToken, setInputToken] = useState('SOL');
  const [outputToken, setOutputToken] = useState('USDC');
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey, connection]);

  const fetchBalance = async () => {
    const balance = await connection.getBalance(publicKey);
    
    setBalance(balance / 1e9); // Convert lamports to SOL
  };

  const handleSwap = async () => {
    setIsLoading(true);
    try {
      const connection = WalletAdapterNetwork.Mainnet;
      const jupiter = await Jupiter.load({
        connection,
        cluster: 'mainnet-beta',
        user: publicKey,
      });

      const routes = await jupiter.computeRoutes({
        inputMint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL mint address
        outputMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC mint address
        amount: inputAmount * 1e9, // Convert to lamports
        slippageBps: 50, // 0.5% slippage
      });

      const { execute } = await jupiter.exchange({
        routeInfo: routes.routesInfos[0],
      });

      const swapResult = await execute(signTransaction);
      console.log('Swap executed:', swapResult);
      
      // Refresh balance after swap
      fetchBalance();
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Swap Tokens</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{balance.toFixed(4)} SOL</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Swap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">From</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-grow"
                />
                <Select value={inputToken} onValueChange={setInputToken}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block mb-2">To</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={outputAmount}
                  readOnly
                  placeholder="Estimated amount"
                  className="flex-grow"
                />
                <Select value={outputToken} onValueChange={setOutputToken}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {
                connection != WalletAdapterNetwork.Mainnet &&
                <p>Only available on Mainnet</p>
            }
            <Button onClick={handleSwap} disabled={(isLoading || !inputAmount) && connection != WalletAdapterNetwork.Mainnet}>
              {isLoading ? 'Swapping...' : 'Swap'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwapPage;