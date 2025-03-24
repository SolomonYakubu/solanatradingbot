// db/models/user.ts
import mongoose from "mongoose";
const tradingSchema = new mongoose.Schema({
    defaultSlippage: { type: Number, default: 5 },
    autoApprove: { type: Boolean, default: false },
    lastUsedTokens: [String],
});
const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    wallets: [
        {
            publicKey: String,
            privateKey: String,
            label: String,
            watchOnly: { type: Boolean, default: false },
            alerts: {
                priceThreshold: Number,
                balanceThreshold: Number,
            },
        },
    ],
    settings: {
        notifications: { type: Boolean, default: true },
        defaultWallet: String,
    },
    watchedTokens: [
        {
            mint: String,
            symbol: String,
            priceAlerts: {
                high: Number,
                low: Number,
            },
        },
    ],
    tradingSettings: tradingSchema,
});
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=user.js.map