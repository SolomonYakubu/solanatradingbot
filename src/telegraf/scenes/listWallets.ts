// telegraf/scenes/listWallets.ts
import { Scenes, Markup } from "telegraf";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
import { MyContext } from "../types.js";

const listWalletsScene = new Scenes.BaseScene<MyContext>("listWallets");

listWalletsScene.enter(async (ctx) => {
  const wallets = ctx.user.wallets;
  if (!wallets || wallets.length === 0) {
    await ctx.reply(
      "No wallets found. Please create one.",
      Markup.inlineKeyboard([
        [Markup.button.callback("Create Wallet", "create_wallet")],
        [Markup.button.callback("🔙 Main Menu", "main_menu")],
      ])
    );
    return ctx.scene.leave(); // Leave the scene if no wallets
  } else {
    let msg = "*My Wallets:*\n";
    wallets.forEach((w, idx) => {
      msg += `${idx + 1}. ${w.label} - \`${w.publicKey}\`\n`;
    });
    const escapedMsg = escapeMarkdownV2(msg);
    await ctx.replyWithMarkdownV2(
      escapedMsg,
      Markup.inlineKeyboard([
        [Markup.button.callback("Create New Wallet", "create_wallet")],
        [Markup.button.callback("🔙 Main Menu", "main_menu")],
      ])
    );
  }
  ctx.scene.leave();
});

export default listWalletsScene;
