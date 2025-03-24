import { Connection } from "@solana/web3.js";
import config from "../config/config.js";

const connection: Connection = new Connection(config.solanaRpcUrl);

export { connection };
