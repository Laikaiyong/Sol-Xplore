'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      const inputMint = 'So11111111111111111111111111111111111111112'; // SOL mint address
      const outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC mint address
      const amount = inputAmount * 1e9; // Convert to lamports

      // Step 1: Fetch routes
      const routesResponse = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`);
      const routes = await routesResponse.json();

      if (!routes.data || routes.data.length === 0) {
        throw new Error('No routes found');
      }

      // Step 2: Get serialized transactions
      const { swapTransaction } = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteResponse: routes.data[0],
          userPublicKey: publicKey.toString(),
          wrapUnwrapSOL: true
        })
      }).then(res => res.json());

      // Step 3: Deserialize and sign the transaction
      const transaction = await connection.deserializeTransaction(swapTransaction);
      const signedTransaction = await signTransaction(transaction);

      // Step 4: Execute the swap
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction({
        signature: txid
    });

      console.log('Swap executed:', txid);
      
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
                connection.rpcEndpoint != process.env.NEXT_PUBLIC_MAINNET &&
                <p>Only available on Mainnet</p>
            }
            <Button onClick={handleSwap} disabled={(isLoading || !inputAmount) && connection.rpcEndpoint != process.env.NEXT_PUBLIC_MAINNET}>
              {isLoading ? 'Swapping...' : 'Swap'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwapPage;