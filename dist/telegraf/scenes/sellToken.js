// telegraf/scenes/sellToken.ts
import { Scenes, Markup } from "telegraf"; // Import Context
import { fetchTokenOnchainInfo } from "../../solana/token.js";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
import logger from "../../config/logger.js";
const sellTokenScene = new Scenes.WizardScene("sellToken", async (ctx) => {
    await ctx.reply("Enter token mint address to sell:");
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Invalid input. Please enter text.");
        return ctx.scene.leave();
    }
    try {
        const tokenAddress = ctx.message.text;
        ctx.scene.state.tokenAddress = tokenAddress;
        const tokenInfo = await fetchTokenOnchainInfo(tokenAddress);
        ctx.scene.state.tokenInfo = tokenInfo;
        await ctx.reply("Enter amount of tokens to sell:");
        return ctx.wizard.next();
    }
    catch (error) {
        logger.error("Token lookup error:", error);
        await ctx.reply("❌ Error looking up token info. Please check the mint address.");
        return ctx.scene.leave();
    }
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Invalid input. Please enter a number.");
        return; // Stay in the scene
    }
    try {
        ctx.scene.state.amount = parseFloat(ctx.message.text);
        if (ctx.scene.state.tokenInfo === undefined) {
            throw new Error("Token info is undefined.");
        }
        const { amount, tokenInfo } = ctx.scene.state;
        if (amount === undefined ||
            tokenInfo === undefined ||
            tokenInfo === null ||
            tokenInfo.price === null) {
            throw new Error("Token info, amount, or price is undefined or null.");
        }
        const estimatedSOL = amount * tokenInfo.price;
        await ctx.replyWithMarkdownV2(escapeMarkdownV2(`*Confirm Sell Order*\n\n` +
            `🪙 Token: *${ctx.scene.state.tokenInfo?.symbol}*\n` +
            `🔢 Amount: *${ctx.scene.state.amount}*\n` +
            `💵 Estimated SOL: *${estimatedSOL.toFixed(4)}*\n` +
            `⏳ Slippage: *${ctx.user.tradingSettings.defaultSlippage}%*`), Markup.inlineKeyboard([
            [Markup.button.callback("✅ Confirm Sale", "confirm_sell")],
            [Markup.button.callback("❌ Cancel", "cancel_trade")],
        ]));
        return ctx.wizard.next();
    }
    catch (error) {
        await ctx.reply("❌ Invalid amount. Please enter a number.");
        return ctx.scene.leave();
    }
});
export default sellTokenScene;
//# sourceMappingURL=sellToken.js.map