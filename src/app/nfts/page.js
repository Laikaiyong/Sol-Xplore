"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
// import { publicKey } from '@metaplex-foundation/umi'
// import { fetchAssetsByOwner } from '@metaplex-foundation/mpl-core'
import {
  getParsedNftAccountsByOwner,
  isValidSolanaAddress,
  createConnectionConfig,
} from "@nfteyez/sol-rayz";

const NFTGallery = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchNFTs();
    }
  }, [connected, publicKey, connection]);

  const fetchMetadata = async (nftArray) => {
    let metadatas = [];
    for (const nft of nftArray) {
      try {
        await fetch(nft.data.uri)
          .then((response) => response.json())
          .then((meta) => {
            metadatas.push({ ...meta, ...nft });
          });
      } catch (error) {
        console.log(error);
      }
    }
    return metadatas;
  };

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const nftArray = await getParsedNftAccountsByOwner({
        publicAddress: publicKey,
        connection: connection,
        limit: 3,
        serialization: true,
      });
      console.log(nftArray);
      if (nftArray.length === 0) {
        setLoading(false);
        return;
      }

      const metadatas = await fetchMetadata(nftArray);
      // var group = {};

      // for (const nft of metadatas) {
      //   console.log(nft);
      //   if (group.hasOwnProperty(nft.data.symbol)) {
      //     group[nft.data.symbol].push(nft);
      //   } else {
      //     group[nft.data.symbol] = [nft];
      //   }
      // }
      // setGroupedNfts(group);
      setNfts(metadatas);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
    setLoading(false);
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please connect your wallet to view your NFTs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading NFTs...</p>
      </div>
    );
  }

  return (
    <>
      {nfts.length == 0 ? (
        <div className="flex items-center justify-center h-screen">
          <p>No NFT Found in this wallet</p>
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">NFT Gallery</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  {nft.image && (
                    <img
                      src={nft.image}
                      alt={nft.name}
                      width={200}
                      height={200}
                      className="rounded-lg mb-2"
                    />
                  )}
                  <h3 className="font-bold">{nft.name}</h3>
                  <p>{nft.symbol}</p>
                  <p>{nft.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NFTGallery;
