const express = require("express")
const bodyParser = require("body-parser");
const Moralis = require("moralis").default;
const {EvmChain} = require("@moralisweb3/common-evm-utils");
 
const app = express();
const PORT = 3000;
app.use(bodyParser.json());

const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjUyZjNlNDM4LTA0ZjEtNDhlOC1iMzY2LTBmZTI0NjAxM2FlMCIsIm9yZ0lkIjoiMzYwMTYyIiwidXNlcklkIjoiMzcwMTUxIiwidHlwZUlkIjoiODM2MDM1ZDItOTdiNS00NzhkLWI0ZjgtMThiYjA5YmRiZjQ3IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTY2NTU0NTcsImV4cCI6NDg1MjQxNTQ1N30.fAegGLW2lFzLy2AiGKDlFXLNTxab6IpjGR7SP7kzNcY";

/*--------------------------FOR EVENTS OF A CONTRACT-------------------------------*/

const abi = {
  anonymous: false,
  inputs: [{
      indexed: true,
      internalType: "address",
      name: "from",
      type: "address",
    },
    {
      indexed: true,
      internalType: "address",
      name: "to",
      type: "address"
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "amount",
      type: "uint256",
    },
  ],
  name: "Transfer",
  type: "event",
};

/* ----------------------------------ACTIVE CHAINS------------------------------*/

app.post("/active-chains", async (req, res) => {
  try {
    const {address,chains} = req.body;
    const response = await Moralis.EvmApi.wallets.getWalletActiveChains({
      address,
      chains,
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Active Chains Of a Wallet",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* ----------------------------------NATIVE BALANCE------------------------------*/
//actual balance of wallet
app.post("/native-balance", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    });
    const chainId = chain;
    const native = response.result.balance.ether;
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Native Balance of Wallet",
      responseResult: {native,chainId}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

/* ----------------------------------ERC20 TOKEN------------------------------*/
//owned by contract address
app.get("/native-erc20-balance", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    });
    const native = response.result.balance.ether;
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Erc20 Tokens Owned By Contract Address",
      responseResult: native,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* ----------------------------------MULTI SIGNATURE WALLET------------------------------*/

app.post("/multisig-balance", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.balance.getNativeBalance({
     /* 
     "address": "0x849D52316331967b6fF1198e5E32A0eB168D039d",
     "chain": 1
     */
      address,
      chain,
    });
    const native = response.result.balance.ether;
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Balance of a Multi Signature Wallet",
      responseResult: native,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* ----------------------------------NFT OWNED---------------------------------*/
//only in single chain
app.post("/nft-owned", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      // "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      // "chain": 1
      address,
      chain,
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "NFT's Owned In a Single Chain",
      responseResult: {
        result: response.result.map((nft) => ({
          amount: nft.amount,
          name: nft.name,
          symbol: nft.symbol,
        })),
      },
    }; 
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT OWNED CROSS-CHAIN---------------------------*/
//in multi chains
app.get("/nft-owned-cross-chain", async (req, res) => {
  try {
    const array = [];
    const chains = [1, 56, 137];
    const {address} = req.body;
    for (const chain of chains) {
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        /*
        "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        */
        address,
        chain
      });
      array.push(response)
    }
    
    res.status(200).json({
      statusCode: 200,
      responseMessage: "NFT's Owned In Multi Chains",
      responseResult: array, 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFTs BY WALLET-----------------------------------*/
//owned by wallet and multichains
app.get("/nft-by-wallet", async (req, res) => {
  try {
    const array = [];
    const chains = [1, 56, 137];
    const{address} = req.body;
    for (const chain of chains) {
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        //"address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
        address,
        chain,
      });
      array.push(response)
    }
    res.status(200).json({
      statusCode: 200,
      responseMessage: "All NFT's Owned By a Wallet",
      responseResult: array,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFTs BY COLLECTION-----------------------------------*/
//all nfts in a single collection
app.post("/nft-by-collection", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getContractNFTs({
      /*
      "address": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
      "chain":1
      */
     address,
     chain,
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "NFT's Owned In a Single Chain",
      responseResult: {
        result: response.result.map((nft) => ({
          amount: nft.amount,
          name: nft.name,
          symbol: nft.symbol,
        })),
      },
    }; 
    res.status(200).json(filteredResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------ERC20 OWNED BY WALLET-----------------------------------*/

app.get("/token-by-wallet", async (req, res) => {
  try {
    const{address,chain} = req.body;
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
     /*
      "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      "chain":1
      */
      address,
      chain,
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "ERC20 Tokens Owned By a Wallet",
      responseResult: response,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------TRANSACTIONS BY WALLET-----------------------------------*/

app.get("/transactions-by-wallet", async (req, res) => {
  try {
    const{address,chain} = req.body;
    const response = await Moralis.EvmApi.transaction.getWalletTransactions({
      /*
      "address": "0x6d77FA0c0cc1181ba128a25e25594f004e03a141",
      "chain": 11155111
      */
      address,
      chain
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "All Transactions Done By a Wallet",
      responseResult: {
        page_size: response.page_size,
        page: response.page,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT TRANSFER BY WALLET-----------------------------------*/

app.get("/nft-transfer-by-wallet", async (req, res) => {
  try {
    const{address,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getWalletNFTTransfers({
      /*
      "address": "0x6d77FA0c0cc1181ba128a25e25594f004e03a141",
      "chain": 11155111
      */
     address,
     chain
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "All NFT Trnsfered By a Wallet",
      responseResult: {
        page_size: response.page_size,
        page: response.page,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------ERC20 TRANSFER BY WALLET-----------------------------------*/

app.get("/erc20-transfer-by-wallet", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      /*
      "address": "0x6d77FA0c0cc1181ba128a25e25594f004e03a141",
      "chain": 11155111
      */
     address,
     chain
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "ERC20 Tokens Transfered By a Wallet",
      responseResult: response,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------ADDRESS BY ENS DOMAIN-----------------------------------*/
//traditional method eg:-.eth or TLDs(Top level domains) like .xyz, .kred, .luxe,
// .art, .club, .nft, .blockchain, .coin
app.get("/ens-domain", async (req, res) => {
  try {
    const {domain} = req.body;
    // "domain": "vitalik.eth" 
    const response = await Moralis.EvmApi.resolve.resolveENSDomain({
      domain
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Address Linked To Given ENS Domain",
      responseResult: response,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});


/* -----------------------------ENS DOMAIN BY ADDRESS-----------------------------------*/

app.get("/ens-domain-by-address", async (req, res) => {
  try {
    const {address} = req.body;
    const response = await Moralis.EvmApi.resolve.resolveAddress({
     // "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
      address
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "ENS Domain Linked to the Given Address",
      responseResult: response,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------ADDRESS BY UNSTOPPABLE DOMAIN-----------------------------------*/
//unstoppable as an alternative eg:-.crypto,.zil
app.post("/unstoppable-domain", async (req, res) => {
  try {
    const {domain} = req.body;
    // "domain": "brad.crypto"
    const response = await Moralis.EvmApi.resolve.resolveDomain({
      domain
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Address Linked To Given Unstoppable Domain",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------METADATA NORMALIZATION-----------------------------------*/
//returns metadata in normalised form
/*Refreshing metadata is resource intensive - therefore we have a cool-off 
period during which the same token can’t be refreshed more than once.
If the token_uri points to IPFS - we allow refreshing every 10 minutes 
for each individual token.*/
app.post("/metadata", async (req, res) => {
  try {
    const {address,chain,tokenId} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      /*
      "address": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
      "chain": 1,
      "tokenId": 1
      */
      address,
      chain,
      tokenId,
      normalizeMetadata: true,
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Normalized Meta Data Of NFT",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------METADATA NFT-----------------------------------*/
//returns metadata of nft
app.post("/metadata-nft", async (req, res) => {
  try {
    const {address,chain,tokenId} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      /*
      "address": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
      "chain": 1,
      "tokenId": 3931
      */
     address,
     chain,
     tokenId
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Meta Data Of NFT",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT TRANSFER BY BLOCK-----------------------------------*/
//All nfts transfered in a block
app.post("/nft-transfer-by-block", async (req, res) => {
  try {
    const {blockNumberOrHash,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTTransfersByBlock({
      /*
      "blockNumberOrHash": 15846571,
      "chain":1
      */
      blockNumberOrHash,
      chain
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "All NFT's Transfered In a Block",
      responseResult: {
        page: response.page,
        page_size: response.page_size,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT TRANSFER BY CONTRACT-----------------------------------*/
//All nfts transfered in a collection
app.get("/nft-transfer-by-contract", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTContractTransfers({
      /*
      "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      "chain":1
      */
     address,
     chain
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "All NFT's Transfered In a Collection",
      responseResult: {
        page: response.page,
        page_size: response.page_size,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT TRANSFER BY ID-----------------------------------*/
//All nfts transfered by token id
app.get("/nft-transfer-by-id", async (req, res) => {
  try {
    const {address,tokenId,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTTransfers({
      /*
      "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      "tokenId": 1,
      "chain":1
      */
     address,
     tokenId,
     chain
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "All Transferes Of NFT By Its Token ID",
      responseResult: {
        page: response.page,
        page_size: response.page_size,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT COLLECTION OWNED BY WALLET-----------------------------------*/

app.get("/nft-collection-by-wallet", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getWalletNFTCollections({
      /*
      "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      "chain":1
      */
     address,
     chain
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "NFT Collection Owned By Wallet",
      responseResult: {
        page: response.page,
        page_size: response.page_size,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT OWNERS BY CONTRACT-----------------------------------*/

app.get("/nft-owner-by-contract", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTOwners({
      /*
      "address": "0x6d77FA0c0cc1181ba128a25e25594f004e03a141",
      "chain":11155111
      */
     address,
     chain
    });
    const filteredResult = response.result.map(item => {
      const { tokenUri, ...rest } = item._data;
      return { _data: rest };
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "NFT Owners By Contract Address",
      responseResult: {
        page: response.page,
        page_size: response.page_size,
        result: filteredResult
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT OWNERS BY TOKENID-----------------------------------*/

app.post("/nft-owner-by-id", async (req, res) => {
  try {
    const {address,chain,tokenId} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTTokenIdOwners({
     /*
      "address": "0xa186d739ca2b3022b966194004c6b01855d59571",
      "chain":1,
      "tokenId": 1
      */
      address,
      chain,
      tokenId
    });
    const filteredResult = response.result.map(item => {
      const { metadata, ...rest } = item._data;
      return { _data: rest };
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "NFT Owners By Token ID",
      responseResult: {
        page: response.page,
        page_size: response.page_size,
        cursor: response.cursor,
        result: filteredResult
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT OWNERS BY COLLECTION-----------------------------------*/

app.get("/nft-owner-by-collection", async (req, res) => {
  try {
    const {address,chain} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTOwners({
      /*
      "address": "0xa186d739ca2b3022b966194004c6b01855d59571",
      "chain":1
      */
     address,
     chain
    });
    const filteredResult = response.result.map(item => {
      const { metadata, ...rest } = item._data;
      return { _data: rest };
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "NFT Owners By Collection Address",
      responseResult: {
        page: response.page,
        page_size: response.page_size,
        cursor: response.cursor,
        result: filteredResult
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT LOWEST PRICE-----------------------------------*/

app.get("/nft-lowest-price", async (req, res) => {
  try {
    const {address,chain,marketplace} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTLowestPrice({
      /*
      "address": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      "chain":1,
      "marketplace": "opensea"
      */
     address,
     chain,
     marketplace
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "NFT's Lowest Price In Market",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------NFT TRADES BY MARKETPLACE-----------------------------------*/

app.get("/nft-trades", async (req, res) => {
  try {
    const {address,chain,marketplace} = req.body;
    const response = await Moralis.EvmApi.nft.getNFTTrades({
      /*
      "address": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
      "chain":1,
      "marketplace": "opensea"
      */
      address,
      chain,
      marketplace
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "NFT's Available For Trade In Market Place",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------top ERC20 tokens by price change-----------------------------------*/
/*
To use this API, you will need an API key under a Moralis account with the Pro 
or above plan. To upgrade your API plan, go to the billing page in the Moralis Dashboard.
*/
app.get("/top-erc20", async (req, res) => {
  try {
    const response =
      await Moralis.EvmApi.marketData.getTopERC20TokensByPriceMovers();
    return res.status(200).json({
      statusCode: 200,
      responseMessage: "List of TOP ERC20 Token",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------top NFT collections by trading volume-----------------------------------*/
/*
To use this API, you will need an API key under a Moralis account with the Pro 
or above plan. To upgrade your API plan, go to the billing page in the Moralis Dashboard.
*/
app.get("/top-nft", async (req, res) => {
  try {
    const response = 
    await Moralis.EvmApi.marketData.getHottestNFTCollectionsByTradingVolume();
    res.status(200).json({
      statusCode: 200,
      responseMessage: "List OF TOP NFT Collection By Trading Volume",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------LOGS FOR CONTRACT-----------------------------------*/

app.post("/logs-contract", async (req, res) => {
  try {
    const {address,topic0,chain} = req.body;
    const response = await Moralis.EvmApi.events.getContractLogs({
      /* 
      "address": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
       "topic0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
       "chain":1
       */
      address,
      topic0,
      chain
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "Events Of The Contract",
      responseResult: {
        page_size: response.page_size,
        page: response.page,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------EVENTS FOR CONTRACT-----------------------------------*/

app.post("/logs-events", async (req, res) => {
  try {
    const {address,topic,chain} = req.body;
    const response = await Moralis.EvmApi.events.getContractEvents({
      /* 
      "address": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      "topic": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
       "chain":1
       */
      address,
      topic,
      chain,
      abi
    });
    const filteredResponse = {
      statusCode: 200,
      responseMessage: "Events Of The Contract",
      responseResult: {
        page_size: response.page_size,
        page: response.page,
        result: response.result
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------ERC20 TOKEN PRICE-----------------------------------*/

app.get("/erc20-price", async (req, res) => {
  try {
    const{address,chain} = req.body;
    const response = await Moralis.EvmApi.token.getTokenPrice({
      /*
      "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "chain":1
      */
     address,
     chain
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "ERC20 Token Price",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------ERC20 TRANSFER BY CONTRACT-----------------------------------*/

app.post("/erc20-transfer-by-contract", async (req, res) => {
  try {
    const{address,chain} = req.body;
    const response = await Moralis.EvmApi.token.getTokenTransfers({
      /*
      "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "chain":1
      */
     address,
     chain
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "All Transferes Of ERC20 Tokens By Contract",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------SUSHISWAP V2 PAIR ADDRESS-----------------------------------*/

app.get("/sushiswap-address", async (req, res) => {
  try {
    const {token0Address,token1Address,chain,} =req.body;
    const response = await Moralis.EvmApi.defi.getPairAddress({
      /*
      "token0Address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "token1Address": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      "chain":1
      */
      token0Address,
      token1Address,
      chain,
      exchange: "sushiswapv2",
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Pair Address By SushiSwap V2",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------SUSHISWAP V2 PAIR RESERVES-----------------------------------*/

app.get("/sushiswap-reserves", async (req, res) => {
  try {
    const {pairAddress,chain,} =req.body;
    const response = await Moralis.EvmApi.defi.getPairReserves({
      /*
      "pairAddress": "0xc40d16476380e4037e6b1a2594caf6a6cc8da967",
      "chain":1
      */
     pairAddress,
     chain
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Reserves Of Token By SushiSwap V2",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------UNISWAP V2 PAIR ADDRESS-----------------------------------*/

app.post("/uniswap-address", async (req, res) => {
  try {
    const {token0Address,token1Address,chain,} =req.body;
    const response = await Moralis.EvmApi.defi.getPairAddress({
      /*
      "token0Address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "token1Address": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      "chain":1
      */
      token0Address,
      token1Address,
      chain,
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Pair Address By UniSwap V2",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------UNISWAP V2 PAIR RESERVES-----------------------------------*/

app.post("/uniswap-reserves", async (req, res) => {
  try {
    const {pairAddress,chain,} =req.body;
    const response = await Moralis.EvmApi.defi.getPairReserves({
      /*
      "pairAddress": "0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974",
      "chain":1
      */
      pairAddress,
     chain
    });
    res.status(200).json({
      statusCode: 200,
      responseMessage: "Reserves Of Token By UniSwap V2",
      responseResult: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      responseMessage: "Invalid Bad Request",
      responseResult: error,
    });
  }
});

/* -----------------------------SERVER START-----------------------------------*/

const startServer = async () => {
  await Moralis.start({
    apiKey: MORALIS_API_KEY,
  });
  app.listen(PORT, () => {
    console.log(`Server is runnig at ${PORT}`);
  })
};
startServer();