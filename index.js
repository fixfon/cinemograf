const { Client } = require('discord.js');
require('dotenv').config();

const EventHandler = require('./handlers/EventHandler.js');
const CommandHandler = require('./handlers/CommandHandler.js');

const client = new Client({
	partials: ['Partials.Message', 'Partials.Channel', 'Partials.Reaction'],
	intents: [
		'GuildMessages',
		'Guilds',
		'GuildIntegrations',
		'GuildMembers',
		'MessageContent',
	],
});

client.commands = CommandHandler();

EventHandler(client);

client.login(process.env.DISCORD_TOKEN);
