// telegraf/middleware.ts
import { Context } from "telegraf";
import User from "../db/models/user.js";
import logger from "../config/logger.js";
import { MyContext } from "./types.js";

async function setupMiddleware(bot: any) {
  //  use 'any' temporarily
  bot.use(async (ctx: MyContext, next: () => Promise<void>) => {
    try {
      const userId = ctx.from?.id.toString();
      if (!userId) {
        // Handle cases where ctx.from or ctx.from.id is undefined
        logger.warn("User ID not found in context.");
        return ctx.reply("❌ Could not identify user. Please try again.");
      }
      let user = await User.findOne({ telegramId: userId });

      if (!user) {
        // Create user with default tradingSettings
        user = await User.create({
          telegramId: userId,
          tradingSettings: {
            defaultSlippage: 5,
            autoApprove: false,
            lastUsedTokens: [],
          },
          wallets: [], // Initialize as empty array
          settings: {
            notifications: true,
          },
          watchedTokens: [], // Initialize as empty array
        });
      }
      // If tradingSettings is missing, set it as well.
      if (!user.tradingSettings) {
        user.set("tradingSettings", {
          defaultSlippage: 5,
          autoApprove: false,
          lastUsedTokens: [],
        });
        await user.save();
      }
      ctx.user = user;
      return next();
    } catch (error) {
      logger.error("Authentication error:", error);
      return ctx.reply("❌ Error authenticating. Please try again.");
    }
  });
}
export { setupMiddleware };
