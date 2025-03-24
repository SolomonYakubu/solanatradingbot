// telegraf/bot.ts
import { Telegraf, Scenes, session } from "telegraf";
import config from "../config/config.js";
import { setupActions } from "./actions.js";
import { setupMiddleware } from "./middleware.js"; // Correct path
import logger from "../config/logger.js";
// Import scenes
import mainMenuScene from "./scenes/mainMenu.js";
import createWalletScene from "./scenes/createWallet.js";
import listWalletsScene from "./scenes/listWallets.js";
import userSettingsScene from "./scenes/userSettings.js";
import viewChartsScene from "./scenes/viewCharts.js";
import tradeMemeScene from "./scenes/tradeMeme.js";
import buyTokenScene from "./scenes/buyToken.js";
import sellTokenScene from "./scenes/sellToken.js";
import tradingSettingsScene from "./scenes/tradingSettings.js";
import checkTokenBalanceScene from "./scenes/checkTokenBalance.js";
import setDefaultWalletScene from "./scenes/setDefaultWallet.js";
const bot = new Telegraf(config.telegramBotToken);
const stage = new Scenes.Stage([
    mainMenuScene,
    createWalletScene,
    listWalletsScene,
    userSettingsScene,
    viewChartsScene,
    tradeMemeScene,
    buyTokenScene,
    sellTokenScene,
    tradingSettingsScene,
    checkTokenBalanceScene,
    setDefaultWalletScene,
], {
    ttl: 600, // Scene TTL of 10 minutes
});
bot.use(session());
bot.use(stage.middleware());
// Set up middleware and actions
setupMiddleware(bot);
setupActions(bot);
// Command handlers
bot.start((ctx) => ctx.scene.enter("mainMenu"));
bot.command("buy", (ctx) => ctx.scene.enter("buyToken"));
bot.command("sell", (ctx) => ctx.scene.enter("sellToken"));
bot.command("balance", (ctx) => ctx.scene.enter("checkTokenBalance"));
// Function to initialize and launch the bot
async function launchBot() {
    try {
        await bot.launch();
        logger.info("Bot started");
    }
    catch (error) {
        logger.error("Bot failed to start:", error);
        process.exit(1); // Exit if bot fails to start
    }
}
export { bot, launchBot };
//# sourceMappingURL=bot.js.map