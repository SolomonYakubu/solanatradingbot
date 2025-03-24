//telegraf/scenes/tradeMeme.ts
import { Scenes, Markup } from "telegraf";
const tradeMemeScene = new Scenes.BaseScene("tradeMeme");
tradeMemeScene.enter(async (ctx) => {
    await ctx.reply("🪙 Meme Coin Trading", Markup.inlineKeyboard([
        [Markup.button.callback("🚀 Buy Token", "buy_token")],
        [Markup.button.callback("💸 Sell Token", "sell_token")],
        [Markup.button.callback("📊 Check Balance", "token_balance")],
        [Markup.button.callback("⚙️ Trading Settings", "trading_settings")],
        [Markup.button.callback("🔙 Main Menu", "main_menu")],
    ]));
});
export default tradeMemeScene;
//# sourceMappingURL=tradeMeme.js.map