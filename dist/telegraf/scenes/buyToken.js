// telegraf/scenes/buyToken.ts
import { Scenes, Markup } from "telegraf"; // Import Context
import { fetchTokenInfo } from "../../solana/token.js";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
import logger from "../../config/logger.js";
const buyTokenScene = new Scenes.WizardScene("buyToken", async (ctx) => {
    await ctx.reply("Enter token mint address:");
    return ctx.wizard.next();
}, async (ctx) => {
    try {
        if (!ctx.message || !("text" in ctx.message)) {
            await ctx.reply("❌ Invalid input. Please enter text.");
            return ctx.scene.leave();
        }
        ctx.scene.state.tokenAddress =
            ctx.message.text.trim();
        const loadingMsg = await ctx.reply("🔍 Fetching token info...");
        const tokenInfo = await fetchTokenInfo(ctx.scene.state.tokenAddress);
        if (ctx.chat) {
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        }
        if (!tokenInfo) {
            throw new Error("Failed to fetch token info");
        }
        ctx.scene.state.tokenInfo = tokenInfo;
        const message = `✅ Token Verified
Name: ${tokenInfo.name}
Symbol: ${tokenInfo.symbol}
Price: ${tokenInfo.price} SOL
Liquidity: ${tokenInfo.liquidity} SOL
24h Volume: ${tokenInfo.volume}
24h Change: ${tokenInfo.priceChange}%
Decimals: ${tokenInfo.decimals}
Logo: ${tokenInfo.logoURI || "Not available"}

Top Pairs:
${tokenInfo.pairs
            .map((pair) => `- ${pair.dex.toUpperCase()}: ${pair.baseToken}/${pair.quoteToken}
  Price: ${pair.price} ${pair.quoteToken}
  Liquidity: ${pair.liquidity} ${pair.quoteToken}`)
            .join("\n")}

Enter amount in SOL:`;
        await ctx.replyWithMarkdownV2(escapeMarkdownV2(message));
        return ctx.wizard.next();
    }
    catch (error) {
        logger.error("Token lookup error:", error);
        const errorMessage = error.message.includes("Invalid public key")
            ? "❌ Invalid token address format. Please check and try again."
            : "❌ Error looking up token info. Please verify the token address and try again.";
        await ctx.reply(errorMessage);
        return ctx.scene.leave();
    }
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Invalid input. Please enter a number.");
        return; // Don't leave the scene, just prompt again
    }
    try {
        const userInput = ctx.message.text.replace(/,/g, "."); // Handle comma
        const amount = parseFloat(userInput);
        if (isNaN(amount) || !isFinite(amount) || amount <= 0) {
            throw new Error("Invalid amount");
        }
        if (!ctx.scene.state.tokenInfo?.price ||
            isNaN(ctx.scene.state.tokenInfo.price ?? 0) ||
            (ctx.scene.state.tokenInfo?.price ?? 0) <= 0) {
            throw new Error("Invalid token price");
        }
        const estimatedTokens = amount /
            (ctx.scene.state.tokenInfo?.price ?? 0);
        if (!isFinite(estimatedTokens)) {
            throw new Error("Invalid calculation");
        }
        const escapeMD = (text) => String(text).replace(/[.!-|#>(){}=_]/g, "\\$&");
        await ctx.replyWithMarkdownV2(`*Confirm Buy Order*\n\n` +
            `🪙 Token: *${escapeMD(ctx.scene.state.tokenInfo.symbol)}*\n` +
            `💵 Amount: *${escapeMD(amount.toFixed(4))} SOL*\n` +
            `📈 Estimated Tokens: *${escapeMD(estimatedTokens.toLocaleString(undefined, {
                maximumFractionDigits: 4,
            }))}*\n` +
            `⏳ Slippage: *${escapeMD(ctx.user.tradingSettings.defaultSlippage)}%*`, Markup.inlineKeyboard([
            [Markup.button.callback("✅ Confirm Purchase", "confirm_buy")],
            [Markup.button.callback("❌ Cancel", "cancel_trade")],
        ]));
        return ctx.wizard.next();
    }
    catch (error) {
        console.log("Error:", error);
        let errorMessage = "❌ Invalid amount. Please enter a valid positive number.";
        if (error.message.includes("token price")) {
            errorMessage = "❌ Invalid token price - please try again later";
        }
        else if (error.message.includes("calculation")) {
            errorMessage = "❌ Invalid calculation - please check the token price";
        }
        await ctx.reply(errorMessage);
        return ctx.scene.leave();
    }
});
export default buyTokenScene;
//# sourceMappingURL=buyToken.js.map