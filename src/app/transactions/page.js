"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const TransactionHistory = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [before, setBefore] = useState(null);

  useEffect(() => {
    if (connected && publicKey) {
      setTransactions([]);
      fetchTransactions();
    }
  }, [connected, publicKey, connection]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const txs = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
        before,
      });
      const txDetails = await Promise.all(
        txs.map((tx) =>
          connection.getTransaction(tx.signature, {
            maxSupportedTransactionVersion: 0,
          })
        )
      );
      const enrichedTxs = txs.map((tx, index) => ({
        ...tx,
        details: txDetails[index],
      }));
      setTransactions((prev) => [...prev, ...enrichedTxs]);
      if (txs.length === 10) {
        setBefore(txs[txs.length - 1].signature);
      } else {
        setBefore(null);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    setLoading(false);
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please connect your wallet to view transaction history.</p>
      </div>
    );
  }

  return (
    <>
      {
        transactions.length == 0 ? (
          <div className="flex items-center justify-center h-screen">
          <p>No Transaction found</p>
          </div>
        ) : (
                <div className="container mx-auto p-4">
                  <h1 className="text-3xl font-bold mb-4">Transaction History</h1>
                <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Signature</TableHead>
              <TableHead className="whitespace-nowrap">Block Time</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Slot</TableHead>
              <TableHead className="whitespace-nowrap">Amount (SOL)</TableHead>
              <TableHead className="whitespace-nowrap">Fee (SOL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.signature}>
                <TableCell className="font-mono">
                  <a
                    href={
                      `https://solscan.io/tx/${tx.signature}` +
                      (connection.rpcEndpoint =="https://api.testnet.solana.com"
                        ? "?cluster=testnet"
                        : connection.rpcEndpoint == "https://api.devnet.solana.com"
                        ? "?cluster=devnet"
                        : "")
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-500">
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    <ExternalLink className="ml-1" size={16} />
                  </a>
                </TableCell>
                <TableCell>
                  {new Date(tx.blockTime * 1000).toLocaleString()}
                </TableCell>
                <TableCell>{tx.confirmationStatus}</TableCell>
                <TableCell>
                  {tx.slot}
                </TableCell>
                <TableCell>
                  {tx.details?.meta?.postBalances[0] &&
                  tx.details?.meta?.preBalances[0]
                    ? (
                        (tx.details.meta.postBalances[0] -
                          tx.details.meta.preBalances[0]) /
                        1e9
                      ).toFixed(4)
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {tx.details?.meta?.fee
                    ? (tx.details.meta.fee / 1e9).toFixed(6)
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {before && (
        <Button onClick={fetchTransactions} disabled={loading} className="mt-4">
          {loading ? "Loading..." : "Load More"}
        </Button>
      )}
    </div>
    )}
    </>
  );
};

export default TransactionHistory;
