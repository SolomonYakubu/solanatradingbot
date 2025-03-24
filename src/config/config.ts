// config/config.ts
import dotenv from "dotenv";
dotenv.config();

interface Config {
  solanaRpcUrl: string;
  telegramBotToken: string;
  mongoDbUri: string;
  pumpFunProgramId: string;
  dexscreenerApiBaseUrl: string;
}

const config: Config = {
  solanaRpcUrl: process.env.SOLANA_RPC_URL!,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
  mongoDbUri: process.env.MONGODB_URI!,
  pumpFunProgramId: process.env.PUMP_FUN_PROGRAM_ID!,
  dexscreenerApiBaseUrl: "https://api.dexscreener.com/latest/dex",
};

export default config;
