const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose = require('mongoose');
const { loadCollection } = require('./src/utils/CollectionHelper');
require('dotenv/config');

const client = new Client({
	intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	],
	partials: [ Partials.Message, Partials.Channel, Partials.Reaction ],
});

new CommandKit({
	client,
	commandsPath: `${__dirname}/src/slashcommands`,
	eventsPath: `${__dirname}/src/events`,
	validationsPath: `${__dirname}/src/validations`,
	devGuildIds: ['1086370614459240538'],
	devUserIds: ['836773043014860810'],
	bulkRegister: true,
});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	require('./error')();
	loadCollection(client, 'buttons');
	loadCollection(client, 'modals');

	await client.login(process.env.BOT_TOKEN);
});