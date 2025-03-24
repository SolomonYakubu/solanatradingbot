// main.ts
import { connectDB } from "./db/connection.js";
import { launchBot } from "./telegraf/bot.js"; // Corrected import
import logger from "./config/logger.js";
async function start() {
    try {
        await connectDB();
        await launchBot();
    }
    catch (error) {
        logger.error("Startup failed:", error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=main.js.map