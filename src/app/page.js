"use client";

import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import Link from "next/link";

const Dashboard = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [tokenBalances, setTokenBalances] = useState([
    { name: "SOL", amount: 0 },
    { name: "USDC", amount: 0 },
    { name: "USDT", amount: 0 },
    { name: "OTHER", amount: 0 },
  ]);
  const [transactions, setTransactions] = useState([]);
  const [transactLine, setTransactLine] = useState([]);
  const [transactionStatus, setTransactionStatus] = useState({
    finalized: 0,
    failed: 0,
    pending: 0,
  });
  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenBalances();
    }
  }, [connected, publicKey, connection]);

  const getTokenSymbol = (mint) => {
    var knownTokens = {
      So11111111111111111111111111111111111111112: "SOL",
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
    };
    // This is a simplified version. In a real app, you'd use a token list or API to get accurate symbols.
    if (connection.rpcEndpoint == "") {
      knownTokens = {
        So11111111111111111111111111111111111111112: "SOL",
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU": "USDC",
        EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS: "USDT",
      };
    } else {
      knownTokens = {
        So11111111111111111111111111111111111111112: "SOL",
        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
        Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
      };
    }
    return knownTokens[mint] || "Others";
  };

  const fetchTokenBalances = async () => {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    const assets = tokenAccounts.value.map((accountInfo) => ({
      mint: accountInfo.account.data.parsed.info.mint,
      amount: accountInfo.account.data.parsed.info.tokenAmount.uiAmount,
      symbol: getTokenSymbol(accountInfo.account.data.parsed.info.mint),
    }));
    const otherAssets = assets.filter((asset) => asset.symbol === "Other");
    const sumOfAmount = otherAssets.reduce(
      (total, asset) => total + parseFloat(asset.amount),
      0
    );

    const ATATokens = {
      SOL: "So11111111111111111111111111111111111111112",
      USDC:
        connection.rpcEndpoint == "https://api.devnet.solana.com"
          ? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
          : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    };

    // Fetch SOL balance
    const solBalance = await connection.getBalance(publicKey);

    // Fetch USDC balance
    const usdcBalance = await getAtaBalance(
      connection,
      publicKey,
      ATATokens.USDC
    );

    // Fetch USDT balance
    const usdtBalance = await getAtaBalance(
      connection,
      publicKey,
      ATATokens.USDT
    );

    setTokenBalances([
      { name: "SOL", amount: solBalance / 1e9 },
      { name: "USDC", amount: usdcBalance / 1e6 },
      { name: "USDT", amount: usdtBalance / 1e6 },
      { name: "OTHER", amount: sumOfAmount },
    ]);

    const transact = await connection.getSignaturesForAddress(publicKey, {
      limit: 5,
    });
    const transactionData = transact.map((tx) => ({
      signature: tx.signature,
      date: new Date(tx.blockTime * 1000).toLocaleDateString(),
      status: tx.confirmationStatus,
    }));
    setTransactions(transactionData);

    const status = transactionData.reduce(
      (acc, tx) => {
        acc[tx.status]++;
        return acc;
      },
      { finalized: 0, failed: 0, pending: 0 }
    );
    setTransactionStatus(status);

    const transactionDates = transactionData.map((tx) => tx.date);
    const uniqueDates = [...new Set(transactionDates)];

    const lineChartData = uniqueDates.map((date) => {
      const transactionsOnDate = transactionData.filter(
        (tx) => tx.date === date
      );
      const finalizedCount = transactionsOnDate.filter(
        (tx) => tx.status === "finalized"
      ).length;
      const failedCount = transactionsOnDate.filter(
        (tx) => tx.status === "failed"
      ).length;
      const pendingCount = transactionsOnDate.filter(
        (tx) => tx.status === "pending"
      ).length;
      return {
        date,
        finalized: finalizedCount,
        failed: failedCount,
        pending: pendingCount,
      };
    });

    setTransactLine(lineChartData);
  };

  const getAtaBalance = async (connection, walletPubkey, mint) => {
    try {
      const ata = await getAssociatedTokenAddress(
        new PublicKey(mint),
        walletPubkey
      );
      const accountData = await getAccount(connection, ata, "confirmed");
      return Number(accountData.amount);
    } catch (error) {
      console.error(`Error fetching balance for mint ${mint}:`, error);
      return 0;
    }
  };

  const COLORS = ["#2BCCB0", "#2670C4", "#4DAA8F", "#1F1F1F"];

  return (
    <div className="container p-4">
      <h1 className="text-3xl font-bold mb-4 px-8">
        Your Solana Wallet Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Asset Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={tokenBalances}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount">
                  {tokenBalances.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4">
              {tokenBalances.map((asset, index) => (
                <div
                  key={asset.name}
                  className="flex justify-between items-center">
                  <span>{asset.name}</span>
                  <span>{asset.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Total",
                }
              }}
              width="100%"
              height={200}>
              <BarChart
                accessibilityLayer
                data={[
                  { name: "Finalized", value: transactionStatus.finalized, fill: "#22bb33" },
                  { name: "Failed", value: transactionStatus.failed, fill: "#bb2124" },
                  { name: "Pending", value: transactionStatus.pending, fill: "#f0ad4e" },
                ]}
                layout="vertical"
                margin={{
                  left: 0,
                }}>
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" layout="vertical" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-end gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total transaction per status
        </div>
      </CardFooter>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} width="100%" height={200}>
            <LineChart accessibilityLayer data={transactLine}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="finalized"
                type="monotone"
                stroke="#22bb33"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="failed"
                type="monotone"
                stroke="#bb2124"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="pending"
                type="monotone"
                stroke="#f0ad4e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {transactions.map((tx) => (
              <li key={tx.signature} className="mb-2">
                <span className="font-mono">
                  {tx.signature.slice(0, 10)}...
                </span>
                <span className="ml-8">{tx.date}</span>
                <span className="ml-8">{tx.status}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/transactions"
            className="text-blue-500 hover:text-blue-700">
            View all transactions
          </Link>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Dashboard;
