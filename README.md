# Solana Trading Bot

A TypeScript-based Telegram bot for trading tokens on the Solana blockchain. Built with Telegraf, Mongoose, and Solana Web3.js, this bot supports wallet management, buying and selling tokens, viewing price charts, and custom trading settings.

## Features

- Wallet creation and management
- Buy and sell tokens via Solana testnet
- View token balances and price charts
- Customizable trading settings (e.g., slippage, max transaction amount)
- Real-time notifications and logging
- Extendable architecture for adding new commands and scenes

## Prerequisites

- Node.js v16 or later
- npm v8 or later
- MongoDB instance (local or hosted)
- Telegram bot token (from BotFather)
- Helius API key
- Solana testnet RPC endpoint

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/solanatradingbot.git
   cd solanatradingbot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and configure variables:
   ```bash
   cp .env.example .env
   # Open .env and fill in your values
   ```

## Configuration

Update the following in your `.env` file:

```properties
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MONGODB_URI=mongodb://localhost:27017/solanabot
SOLANA_RPC_URL=https://api.testnet.solana.com
PUMP_FUN_PROGRAM_ID=YourProgramID
HELIUS_API_KEY=your_helius_api_key
```

## Available Scripts

- **npm run dev**: Start the bot in development mode (ts-node)
- **npm run build**: Compile TypeScript to JavaScript
- **npm start**: Run compiled JavaScript
- **npm run watch**: Restart on file changes (nodemon)
- **npm test**: Run test suite (not yet implemented)

## Project Structure

```
├── src/
│   ├── main.ts            # Entry point
│   ├── config/            # Configuration loaders
│   ├── db/                # Database connection and models
│   ├── solana/            # Solana connection & instruction builders
│   ├── telegraf/          # Bot logic, actions, scenes, middleware
│   └── utils/             # Helper functions and data decoders
├── combined.log
├── error.log
├── .env.example
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

## Logging

The bot uses Winston for logging to `combined.log` and `error.log`. Adjust log levels in `src/config/logger.ts`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with improvements or bug fixes.

## License

This project is licensed under the ISC License. See [LICENSE](./LICENSE) for details.
