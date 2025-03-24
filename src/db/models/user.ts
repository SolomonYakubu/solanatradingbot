// db/models/user.ts
import mongoose, { Schema, Document, Model } from "mongoose";

interface ITradingSettings extends Document {
  defaultSlippage: number;
  autoApprove: boolean;
  lastUsedTokens: string[];
}

const tradingSchema: Schema = new mongoose.Schema({
  defaultSlippage: { type: Number, default: 5 },
  autoApprove: { type: Boolean, default: false },
  lastUsedTokens: [String],
});

interface IWallet extends Document {
  publicKey: string;
  createdAt: Date;
  updatedAt: Date;
  privateKey: string;
  label: string;
  watchOnly: boolean;
  alerts: {
    priceThreshold?: number; // Made optional with ?
    balanceThreshold?: number;
  };
}

interface IWatchedToken extends Document {
  mint: string;
  symbol: string;
  priceAlerts: {
    high?: number;
    low?: number;
  };
}

interface ISettings extends Document {
  notifications: boolean;
  defaultWallet?: string; // Optional
}

export interface IUser extends Document {
  telegramId: string;
  wallets: IWallet[];
  settings: ISettings;
  watchedTokens: IWatchedToken[];
  tradingSettings: ITradingSettings;
}

const userSchema: Schema = new mongoose.Schema({
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

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
