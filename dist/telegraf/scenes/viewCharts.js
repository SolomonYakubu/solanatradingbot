//telegraf/scenes/viewCharts.ts
import { Scenes, Markup } from "telegraf";
const viewChartsScene = new Scenes.BaseScene("viewCharts");
viewChartsScene.enter(async (ctx) => {
    await ctx.reply("Price Charts feature is not implemented yet.", Markup.inlineKeyboard([
        [Markup.button.callback("🔙 Main Menu", "main_menu")],
    ]));
    ctx.scene.leave();
});
export default viewChartsScene;
//# sourceMappingURL=viewCharts.js.map