// telegraf/scenes/tradingSettings.ts
import { Scenes, Markup } from "telegraf";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
const tradingSettingsScene = new Scenes.BaseScene("tradingSettings");
tradingSettingsScene.enter(async (ctx) => {
    // Ensure tradingSettings exists on the user
    if (!ctx.user.tradingSettings) {
        ctx.user.tradingSettings = {
            defaultSlippage: 5,
            autoApprove: false,
            lastUsedTokens: [],
        };
        await ctx.user.save();
    }
    const settings = ctx.user.tradingSettings;
    const message = `⚙️ *Trading Settings*\n\n` +
        `🔀 Default Slippage: *${settings.defaultSlippage}%*\n` +
        `🤖 Auto Approve Trades: *${settings.autoApprove ? "✅ Enabled" : "❌ Disabled"}*`;
    const escapedMessage = escapeMarkdownV2(message);
    await ctx.replyWithMarkdownV2(escapedMessage, Markup.inlineKeyboard([
        [Markup.button.callback("Set Slippage", "set_slippage")],
        [Markup.button.callback("Toggle Auto Approve", "toggle_auto_approve")],
        [Markup.button.callback("🔙 Back", "trade_tokens")],
    ]));
});
export default tradingSettingsScene;
//# sourceMappingURL=tradingSettings.js.map