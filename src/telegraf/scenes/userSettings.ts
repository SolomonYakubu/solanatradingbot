// telegraf/scenes/userSettings.ts
import { Scenes, Markup } from "telegraf";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
import { MyContext } from "../types.js";

const userSettingsScene = new Scenes.BaseScene<MyContext>("userSettings");

userSettingsScene.enter(async (ctx) => {
  if (!ctx.user.tradingSettings) {
    ctx.user.tradingSettings = {
      defaultSlippage: 5,
      autoApprove: false,
      lastUsedTokens: [],
    } as any;
    await ctx.user.save();
  }

  const settings = ctx.user.settings;
  const message =
    `*User Settings*\n\n` +
    `Notifications: ${
      settings.notifications ? "✅ Enabled" : "❌ Disabled"
    }\n` +
    `Default Wallet: \`${settings.defaultWallet || "Not set"}\`\n\n` +
    "Select an option:";

  const escapedMessage = escapeMarkdownV2(message);

  await ctx.replyWithMarkdownV2(
    escapedMessage,
    Markup.inlineKeyboard([
      [Markup.button.callback("Toggle Notifications", "toggle_notifications")],
      [Markup.button.callback("Set Default Wallet", "set_default_wallet")],
      [Markup.button.callback("🔙 Main Menu", "main_menu")],
    ])
  );
});

export default userSettingsScene;
