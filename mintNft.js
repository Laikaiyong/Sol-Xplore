const apiKey = "API+KEY";
const chain = "solana"; // or "polygon-amoy", "ethereum-sepolia", ...
const env = "staging"; // or "www"
const recipientEmail = "vandycklai@gmail.com";
const recipientAddress = `DnhmBBGMiKLtG2gj5VCq4TPmgFT9dwDxDoUPAmrSNWqa`;

const url = `https://${env}.crossmint.com/api/2022-06-09/collections/default/nfts`;
const options = {
    method: "POST",
    headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey,
    },
    body: JSON.stringify({
        recipient: recipientAddress,
        metadata: {
            name: "Random Pic",
            image: "https://picsum.photos/400",
            description: "My first NFT using Crossmint",
        },
    }),
};

fetch(url, options)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((err) => console.error("error:" + err));
