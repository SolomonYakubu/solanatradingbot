// telegraf/scenes/createWallet.ts
import { Scenes } from "telegraf";
import { Keypair } from "@solana/web3.js";
import { escapeMarkdownV2 } from "../../utils/helpers.js";
import mongoose from "mongoose";
const createWalletScene = new Scenes.BaseScene("createWallet");
createWalletScene.enter(async (ctx) => {
    const keypair = Keypair.generate();
    const label = `Wallet ${ctx.user.wallets.length + 1}`;
    const newWallet = {
        publicKey: keypair.publicKey.toString(),
        privateKey: Buffer.from(keypair.secretKey).toString("base64"),
        label,
        watchOnly: false,
        alerts: {},
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    ctx.user.wallets.push(newWallet);
    await ctx.user.save();
    await ctx.replyWithMarkdownV2(escapeMarkdownV2(`✅ *New Wallet Created!*\nLabel: *${label}*\nAddress: \`${keypair.publicKey}\`\n\n⚠️ *PRIVATE KEY (SAVE SECURELY):* \`${Buffer.from(keypair.secretKey).toString("base64")}\``));
    return ctx.scene.enter("mainMenu");
});
export default createWalletScene;
//# sourceMappingURL=createWallet.js.map