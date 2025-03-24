// telegraf/scenes/checkTokenBalance.ts
import { Scenes, Markup } from "telegraf";
import { checkTokenBalance } from "../../solana/token.js";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
import { MyContext } from "../types.js";

interface CheckTokenBalanceSceneState {
  walletAddress?: string;
  tokenMint?: string;
}

const checkTokenBalanceScene = new Scenes.WizardScene<MyContext>(
  "checkTokenBalance",
  async (ctx) => {
    (ctx.scene.state as CheckTokenBalanceSceneState).walletAddress =
      ctx.user.settings.defaultWallet;
    if (!(ctx.scene.state as CheckTokenBalanceSceneState).walletAddress) {
      await ctx.reply(
        "❌ No default wallet set. Please set a default wallet in settings."
      );
      return ctx.scene.leave(); // Exit if no default wallet
    }
    await ctx.reply("Enter token mint address:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("❌ Invalid input. Please enter text.");
      return ctx.scene.leave();
    }
    (ctx.scene.state as CheckTokenBalanceSceneState).tokenMint =
      ctx.message.text;
    try {
      const balance = await checkTokenBalance(
        (ctx.scene.state as CheckTokenBalanceSceneState).walletAddress!,
        (ctx.scene.state as CheckTokenBalanceSceneState).tokenMint!
      );
      await ctx.replyWithMarkdownV2(
        escapeMarkdownV2(
          `💰 *Token Balance*\nWallet: \`${
            (ctx.scene.state as CheckTokenBalanceSceneState).walletAddress
          }\`\nBalance: *${balance.toFixed(4)}*`
        )
      );
    } catch (error: any) {
      await ctx.reply(error.message); // Display the error message from checkTokenBalance
    }
    ctx.scene.leave();
  }
);
export default checkTokenBalanceScene;
