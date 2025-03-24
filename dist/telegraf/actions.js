// telegraf/actions.ts
import { Markup } from "telegraf";
import { Keypair, Transaction, PublicKey, VersionedTransaction, } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { createBuyInstruction, createSellInstruction, } from "../solana/instructionBuilder.js";
import { connection } from "../solana/token.js";
import logger from "../config/logger.js";
import User from "../db/models/user.js";
import { escapeMarkdownV2 } from "../utils/helpers.js";
function setupActions(bot) {
    //  use 'any' temporarily
    bot.action("main_menu", (ctx) => ctx.scene.enter("mainMenu"));
    bot.action("trade_tokens", (ctx) => ctx.scene.enter("tradeMeme"));
    bot.action("buy_token", (ctx) => ctx.scene.enter("buyToken"));
    bot.action("sell_token", (ctx) => ctx.scene.enter("sellToken"));
    bot.action("token_balance", (ctx) => ctx.scene.enter("checkTokenBalance"));
    bot.action("trading_settings", (ctx) => ctx.scene.enter("tradingSettings"));
    bot.action("list_wallets", (ctx) => ctx.scene.enter("listWallets"));
    bot.action("view_charts", (ctx) => ctx.scene.enter("viewCharts"));
    bot.action("user_settings", (ctx) => ctx.scene.enter("userSettings"));
    bot.action("create_wallet", (ctx) => ctx.scene.enter("createWallet"));
    bot.action("set_default_wallet", (ctx) => ctx.scene.enter("setDefaultWallet"));
    bot.action("toggle_notifications", async (ctx) => {
        try {
            ctx.user.settings.notifications = !ctx.user.settings.notifications;
            await ctx.user.save();
            await ctx.reply(`Notifications are now ${ctx.user.settings.notifications ? "Enabled" : "Disabled"}.`, Markup.inlineKeyboard([
                [Markup.button.callback("🔙 Main Menu", "main_menu")],
            ]));
            ctx.scene.leave();
        }
        catch (error) {
            await ctx.reply("❌ Error toggling notifications.");
            ctx.scene.leave();
        }
    });
    bot.action("cancel_trade", (ctx) => {
        ctx.reply("Trade cancelled.", Markup.inlineKeyboard([
            [Markup.button.callback("🔙 Main Menu", "main_menu")],
        ]));
        ctx.scene.leave();
    });
    bot.action("confirm_buy", async (ctx) => {
        try {
            // Ensure that the necessary state exists.  This is CRITICAL for TS.
            if (!ctx.scene.state ||
                !("tokenAddress" in ctx.scene.state &&
                    typeof ctx.scene.state.tokenAddress === "string") ||
                !("amount" in ctx.scene.state &&
                    typeof ctx.scene.state.amount === "number") ||
                !("tokenInfo" in ctx.scene.state &&
                    typeof ctx.scene.state.tokenInfo === "object" &&
                    ctx.scene.state.tokenInfo !== null)) {
                await ctx.reply("❌ Missing transaction details. Please start a new buy order.");
                return ctx.scene.leave();
            }
            const user = await User.findById(ctx.user._id);
            if (!user) {
                throw new Error("User not found in database"); // More specific error
            }
            const wallet = user.wallets.find((w) => w.publicKey === user.settings.defaultWallet);
            if (!wallet)
                throw new Error("No default wallet set");
            if (wallet.watchOnly)
                throw new Error("Watch-only wallet cannot trade");
            const keypair = Keypair.fromSecretKey(Buffer.from(wallet.privateKey, "base64"));
            const tokenAccount = await getAssociatedTokenAddress(new PublicKey(ctx.scene.state.tokenAddress), keypair.publicKey);
            const tx = new Transaction().add(createBuyInstruction({
                user: keypair.publicKey,
                tokenMint: new PublicKey(ctx.scene.state.tokenAddress),
                tokenAccount,
                amount: ctx.scene.state.amount * 1e9, // SOL to lamports
                slippage: user.tradingSettings.defaultSlippage,
            }));
            const versionedTx = new VersionedTransaction(tx.compileMessage());
            versionedTx.sign([keypair]);
            const signature = await connection.sendTransaction(versionedTx);
            await ctx.replyWithMarkdownV2(escapeMarkdownV2(`✅ *Buy Order Executed!*\n${ctx.scene.state.amount} SOL → ${ctx.scene.state.tokenInfo.symbol}\n🔗 [View Transaction](https://solscan.io/tx/${signature})`));
            user.tradingSettings.lastUsedTokens = [
                ctx.scene.state.tokenAddress,
                ...user.tradingSettings.lastUsedTokens
                    .filter((t) => t !== ctx.scene.state.tokenAddress)
                    .slice(0, 4),
            ];
            await user.save();
        }
        catch (error) {
            logger.error("Buy error:", error);
            await ctx.reply(`❌ Transaction failed: ${error.message}`);
        }
        ctx.scene.leave();
    });
    bot.action("confirm_sell", async (ctx) => {
        try {
            if (!ctx.scene.state ||
                !("tokenAddress" in ctx.scene.state &&
                    typeof ctx.scene.state.tokenAddress === "string") ||
                !("amount" in ctx.scene.state &&
                    typeof ctx.scene.state.amount === "number") ||
                !("tokenInfo" in ctx.scene.state &&
                    typeof ctx.scene.state.tokenInfo === "object")) {
                await ctx.reply("❌ Missing transaction details. Please start a new sell order.");
                return ctx.scene.leave();
            }
            const user = await User.findById(ctx.user._id);
            if (!user) {
                throw new Error("User not found in database"); // More specific error
            }
            const wallet = user.wallets.find((w) => w.publicKey === user.settings.defaultWallet);
            if (!wallet)
                throw new Error("No default wallet set");
            if (wallet.watchOnly)
                throw new Error("Watch-only wallet cannot trade");
            const keypair = Keypair.fromSecretKey(Buffer.from(wallet.privateKey, "base64"));
            const tokenAccount = await getAssociatedTokenAddress(new PublicKey(ctx.scene.state.tokenAddress), keypair.publicKey);
            const tx = new Transaction().add(createSellInstruction({
                user: keypair.publicKey,
                tokenMint: new PublicKey(ctx.scene.state.tokenAddress),
                tokenAccount,
                amount: ctx.scene.state.amount * 1e9, // Token amount to lamports (consider decimals)
                slippage: user.tradingSettings.defaultSlippage,
            }));
            const versionedTx = new VersionedTransaction(tx.compileMessage());
            versionedTx.sign([keypair]);
            const signature = await connection.sendTransaction(versionedTx);
            `✅ *Sell Order Executed!*\n${ctx.scene.state.amount} ${ctx.scene.state.tokenInfo.symbol} → SOL\n🔗 [View Transaction](https://solscan.io/tx/${signature})`;
            await ctx.replyWithMarkdownV2(escapeMarkdownV2(`✅ *Sell Order Executed!*\n${ctx.scene.state.amount} ${ctx.scene.state.tokenInfo.symbol} → SOL\n🔗 [View Transaction](https://solscan.io/tx/${signature})`));
            user.tradingSettings.lastUsedTokens = [
                ctx.scene.state.tokenAddress,
                ...user.tradingSettings.lastUsedTokens
                    .filter((t) => t !== ctx.scene.state.tokenAddress)
                    .slice(0, 4),
            ];
            await user.save();
        }
        catch (error) {
            logger.error("Sell error:", error);
            await ctx.reply(`❌ Transaction failed: ${error.message}`);
        }
        ctx.scene.leave();
    });
}
export { setupActions };
//# sourceMappingURL=actions.js.map