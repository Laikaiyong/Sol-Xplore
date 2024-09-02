"use client";

import React, { useState } from "react";
import { useNetwork } from '../../../app/network-context';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  ArrowLeftRight,
  Search,
  ShoppingCart,
  Users,
  Clock,
  Sparkles,
} from "lucide-react"
import Link from "next/link";
import Image from "next/image";

const TopNavbar = ({ children }) => {
  const { connected } = useWallet();
const { network, setNetwork } = useNetwork();

    const handleNetworkChange = (event) => {
        setNetwork(event);
    };

  return (
    <>
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/logo.png" width={130} height={50} alt="sol-xplore logo" />
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Clock className="h-4 w-4" />
              Transaction
            </Link>
            <Link
              href="/nfts"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Sparkles  className="h-4 w-4" />
              Nft
            </Link>
            <Link
              href="/swap"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Swap
            </Link>
          </nav>
        </div>
      </div>
    </div>
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                        <Image src="/logo.png" width={130} height={50} alt="sol-xplore logo" />
              </Link>
              <Link
                href="/"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
              >
                <Clock className="h-5 w-5" />
                Transaction
              </Link>
              <Link
                href="/nfts"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
              >
                <Sparkles  className="h-5 w-5" />
                Nfts
              </Link>
              <Link
                href="/swap"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftRight className="h-5 w-5" />
                Swap
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="w-full flex-1">
        </div>
        <Select value={network} onValueChange={handleNetworkChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={WalletAdapterNetwork.Mainnet}>Mainnet</SelectItem>
              <SelectItem value={WalletAdapterNetwork.Testnet}>Testnet</SelectItem>
              <SelectItem value={WalletAdapterNetwork.Devnet}>Devnet</SelectItem>
            </SelectContent>
          </Select>
        <WalletMultiButton />
      </header>
      {children}
      </div>
    </>
  );
};

export default TopNavbar;
