// utils/helpers.ts
// Helper retry function
async function retry(fn, { retries = 3, minTimeout = 1000, factor = 2 } = {}) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < retries - 1) {
                const timeout = minTimeout * Math.pow(factor, i);
                await new Promise((resolve) => setTimeout(resolve, timeout));
            }
        }
    }
    throw lastError;
}
function escapeMarkdownV2(text) {
    return text.replace(/([_*[\]()~`>#+\-=|{}\.!])/g, "\\$1");
}
export { retry, escapeMarkdownV2 };
//# sourceMappingURL=helpers.js.map