//telegraf/scenes/viewCharts.ts
import { Scenes, Markup } from "telegraf";
import { MyContext } from "../types.js";

const viewChartsScene = new Scenes.BaseScene<MyContext>("viewCharts");

viewChartsScene.enter(async (ctx) => {
  await ctx.reply(
    "Price Charts feature is not implemented yet.",
    Markup.inlineKeyboard([
      [Markup.button.callback("🔙 Main Menu", "main_menu")],
    ])
  );
  ctx.scene.leave();
});

export default viewChartsScene;
