// config/config.ts
import dotenv from "dotenv";
dotenv.config();
const config = {
    solanaRpcUrl: process.env.SOLANA_RPC_URL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    mongoDbUri: process.env.MONGODB_URI,
    pumpFunProgramId: process.env.PUMP_FUN_PROGRAM_ID,
    dexscreenerApiBaseUrl: "https://api.dexscreener.com/latest/dex",
};
export default config;
//# sourceMappingURL=config.js.map