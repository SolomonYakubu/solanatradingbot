// telegraf/scenes/mainMenu.ts
import { Scenes, Markup } from "telegraf";
const mainMenuScene = new Scenes.BaseScene("mainMenu");
mainMenuScene.enter(async (ctx) => {
    await ctx.replyWithMarkdownV2("*Main Menu*\n\nChoose an option:", Markup.inlineKeyboard([
        [Markup.button.callback("🪙 Trade Meme Coins", "trade_tokens")],
        [Markup.button.callback("💰 My Wallets", "list_wallets")],
        [Markup.button.callback("📈 Price Charts", "view_charts")],
        [Markup.button.callback("⚙️ Settings", "user_settings")],
    ]));
});
export default mainMenuScene;
//# sourceMappingURL=mainMenu.js.map