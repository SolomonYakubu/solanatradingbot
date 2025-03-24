// telegraf/scenes/setDefaultWallet.ts
import { Scenes, Markup } from "telegraf";
import { PublicKey } from "@solana/web3.js";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
import logger from "../../config/logger.js";
const setDefaultWalletScene = new Scenes.WizardScene("setDefaultWallet", async (ctx) => {
    await ctx.reply("🔑 *Send the Solana wallet address you want to set as default:*\n\n" +
        "Example: `8Y5RM6jgbXvYJ9nW7Zvw4qHRFLsWpZ3JA2w4S4QWE6tZ`\n" +
        "Type /cancel to abort", { parse_mode: "MarkdownV2" });
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Invalid input. Please enter text.");
        return ctx.scene.leave();
    }
    try {
        const walletAddress = ctx.message.text.trim();
        // Validate Solana public key
        if (!PublicKey.isOnCurve(new PublicKey(walletAddress).toBuffer())) {
            throw new Error("Invalid Solana wallet address");
        }
        // Save to database (replace with your actual storage)
        ctx.user.settings.defaultWallet = walletAddress;
        await ctx.user.save();
        await ctx.replyWithMarkdownV2(escapeMarkdownV2(`✅ *Default wallet set successfully!*\n\n` + `\`${walletAddress}\``), Markup.inlineKeyboard([
            [Markup.button.callback("🏠 Return to Main Menu", "main_menu")],
        ]));
        return ctx.scene.leave();
    }
    catch (error) {
        logger.error(error);
        await ctx.replyWithMarkdownV2("❌ *Invalid wallet address*\n\n" +
            "Please send a valid Solana public key\n" +
            "Example: `8Y5RM6jgbXvYJ9nW7Zvw4qHRFLsWpZ3JA2w4S4QWE6tZ`\n" +
            "Type /cancel to abort");
        return ctx.scene.leave();
    }
});
export default setDefaultWalletScene;
//# sourceMappingURL=setDefaultWallet.js.map