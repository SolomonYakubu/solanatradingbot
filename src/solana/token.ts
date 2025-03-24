// solana/token.ts
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, PublicKey as UmiPublicKey } from "@metaplex-foundation/umi"; // Corrected type import
import {
  findMetadataPda,
  fetchMetadata,
  deserializeMetadata,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import fetch, { Response } from "node-fetch";
import config from "../config/config.js";
import { decodeTokenInfo } from "../utils/dataDecoder.js"; // Assuming this is also converted to TS
import logger from "../config/logger.js";

const connection: Connection = new Connection(config.solanaRpcUrl);

interface TokenInfoResult {
  name: string;
  symbol: string;
  price: number | null;
  liquidity: number | null;
  volume: number | null;
  priceChange: number | null;
  decimals: number;
  logoURI: string | null;
  pairs: PairInfo[];
}

interface PairInfo {
  dex: string;
  baseToken: string | undefined;
  quoteToken: string | undefined;
  price: number | undefined;
  liquidity: number | undefined;
}
interface DexScreenerResponse {
  pairs?: Pair[];
}

interface Pair {
  dexId: string;
  baseToken: {
    name?: string;
    symbol?: string;
  };
  quoteToken?: {
    symbol?: string;
  };
  priceUsd?: number;
  liquidity?: {
    usd?: number;
  };
  volume?: {
    h24?: number;
  };
  priceChange?: {
    h24?: number;
  };
}

async function fetchTokenOnchainInfo(
  tokenMintStr: string
): Promise<ReturnType<typeof decodeTokenInfo>> {
  try {
    const tokenMint: PublicKey = new PublicKey(tokenMintStr);
    const seeds = [Buffer.from("token_info"), tokenMint.toBuffer()];
    const [pda, _bump] = await PublicKey.findProgramAddress(
      seeds,
      new PublicKey(config.pumpFunProgramId)
    );

    const accountInfo = await connection.getAccountInfo(pda);
    if (!accountInfo) {
      throw new Error("Token info account not found");
    }
    // Ensure decodeTokenInfo handles potential null/undefined values
    return decodeTokenInfo(accountInfo.data);
  } catch (error) {
    logger.error("Detailed error in fetchTokenOnchainInfo:", error);
    throw error;
  }
}
async function fetchTokenInfo(tokenMintStr: string): Promise<TokenInfoResult> {
  const umi = createUmi(config.solanaRpcUrl);
  const mintAddress: UmiPublicKey = publicKey(tokenMintStr);

  const tokenInfo: TokenInfoResult = {
    name: "Unknown",
    symbol: "UNKNOWN",
    price: null,
    liquidity: null,
    volume: null,
    priceChange: null,
    decimals: 9,
    logoURI: null,
    pairs: [],
  };

  try {
    // 1. Attempt to fetch Metaplex metadata
    try {
      const metadataPda = findMetadataPda(umi, { mint: mintAddress });
      const metadata = await fetchMetadata(umi, metadataPda);
      if (metadata) {
        tokenInfo.name =
          metadata.name.replace(/\0/g, "").trim().slice(0, 32) || "Unknown";
        tokenInfo.symbol =
          metadata.symbol.replace(/\0/g, "").trim().slice(0, 10) || "UNKNOWN";

        // Fetch off-chain metadata with timeout
        if (metadata.uri) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const response: Response = await fetch(metadata.uri, {
              signal: controller.signal,
            });
            const jsonData: any = await response.json(); // Use 'any' for flexibility
            tokenInfo.logoURI = jsonData.image || jsonData.logoURI;
            clearTimeout(timeoutId);

            if (tokenInfo.name === "Unknown" && jsonData.name)
              tokenInfo.name = jsonData.name;
            if (tokenInfo.symbol === "UNKNOWN" && jsonData.symbol)
              tokenInfo.symbol = jsonData.symbol;
          } catch (offChainError) {
            logger.error("Off-chain metadata fetch failed:", offChainError);
          }
        }
      }
    } catch (metadataError) {
      logger.error("Metadata fetch error:", metadataError);
    }

    // 2. Token List Registry fallback
    if (tokenInfo.name === "Unknown") {
      try {
        const provider = new TokenListProvider();
        const tokenList: TokenInfo[] = await provider
          .resolve()
          .then((tokens) => tokens.filterByChainId(101).getList());
        const token = tokenList.find(
          (t) => t.address === mintAddress.toString()
        );

        if (token) {
          tokenInfo.name = token.name;
          tokenInfo.symbol = token.symbol;
          tokenInfo.decimals = token.decimals;
          tokenInfo.logoURI = token.logoURI ?? null;
        }
      } catch (tokenListError) {
        logger.error("Token list error:", tokenListError);
      }
    }
    // 3. DexScreener fallback for name/symbol
    if (tokenInfo.name === "Unknown") {
      try {
        const dexscreenerResponse: Response = await fetch(
          `${config.dexscreenerApiBaseUrl}/tokens/${mintAddress.toString()}`
        );
        const screenerData: DexScreenerResponse =
          (await dexscreenerResponse.json()) as DexScreenerResponse;

        if (screenerData.pairs?.length) {
          const baseToken = screenerData.pairs[0].baseToken;
          if (baseToken.name) tokenInfo.name = baseToken.name;
          if (baseToken.symbol) tokenInfo.symbol = baseToken.symbol;
        }
      } catch (dexscreenerError) {
        logger.error("DexScreener fallback error:", dexscreenerError);
      }
    }

    // 4. Fetch DexScreener market data
    try {
      const dexscreenerResponse: Response = await fetch(
        `${config.dexscreenerApiBaseUrl}/tokens/${mintAddress.toString()}`
      );
      const screenerData: DexScreenerResponse =
        (await dexscreenerResponse.json()) as DexScreenerResponse;

      if (screenerData.pairs?.length) {
        const mostLiquidPair = screenerData.pairs.reduce(
          (max, pair) =>
            (pair.liquidity?.usd || 0) > (max.liquidity?.usd || 0) ? pair : max,
          {
            dexId: "",
            baseToken: { name: "", symbol: "" },
            quoteToken: { symbol: "" },
            priceUsd: 0,
            liquidity: { usd: -Infinity },
            volume: { h24: 0 },
            priceChange: { h24: 0 },
          }
        );

        tokenInfo.price = mostLiquidPair.priceUsd ?? null;
        tokenInfo.liquidity = mostLiquidPair.liquidity?.usd ?? null;
        tokenInfo.volume = mostLiquidPair.volume?.h24 ?? null;
        tokenInfo.priceChange = mostLiquidPair.priceChange?.h24 ?? null;
        tokenInfo.pairs =
          screenerData.pairs?.map((pair) => ({
            dex: pair.dexId,
            baseToken: pair.baseToken?.symbol,
            quoteToken: pair.quoteToken?.symbol,
            price: pair.priceUsd,
            liquidity: pair.liquidity?.usd,
          })) ?? [];
      }
    } catch (dexscreenerError) {
      logger.error("DexScreener data error:", dexscreenerError);
    }
  } catch (error) {
    logger.error("Global error:", error);
  }

  return tokenInfo;
}
async function checkTokenBalance(
  walletAddress: string,
  tokenMint: string
): Promise<number> {
  try {
    const tokenAccount: PublicKey = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      new PublicKey(walletAddress)
    );
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount) / 1e9; // Adjust for decimals as needed
  } catch (error) {
    logger.error("Error fetching token balance:", error);
    throw new Error("Failed to fetch token balance."); // Re-throw for handling in scene
  }
}

export {
  fetchTokenOnchainInfo,
  fetchTokenInfo,
  checkTokenBalance,
  connection,
  TokenInfoResult,
};
