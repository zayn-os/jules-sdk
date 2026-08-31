import { jules } from '@google/jules-sdk';
import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { message } from 'telegraf/filters';

dotenv.config();

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const githubRepo = process.env.GITHUB_REPO; // e.g. "your-username/your-repo-name"

if (!telegramToken) {
  console.error("Please set TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

if (!githubRepo) {
  console.error("Please set GITHUB_REPO in .env");
  process.exit(1);
}

const bot = new Telegraf(telegramToken);

bot.start((ctx) => {
  ctx.reply('Welcome! I am your Jules AI Assistant. Ask me anything about the repo!');
});

bot.on(message('text'), async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    // Send typing action to let user know bot is processing
    await ctx.sendChatAction('typing');

    // Create or rehydrate a session connected to your repo
    const session = await jules.session({
      prompt: 'You are my helpful AI assistant. Answer my questions based on this repository.',
      source: { github: githubRepo, baseBranch: 'main' },
    });

    // Send the user's message to the agent and wait for the reply
    const reply = await session.ask(userMessage);

    // Reply back to the user on Telegram
    await ctx.reply(reply.message);
  } catch (error) {
    console.error("Error communicating with Jules:", error);
    await ctx.reply("Sorry, I encountered an error while processing your request.");
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log("Telegram bot is running...");

// --- Dummy HTTP Server for Free Hosting Tiers (like Render Web Service) ---
// Free tiers often require a web server to bind to a port to keep the app alive.
import http from 'http';

const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Telegram Bot is running!\n');
});

server.listen(port, () => {
  console.log(`Dummy HTTP server listening on port ${port} to satisfy health checks.`);
});
