const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client?.user?.tag}`);
		// client.users.fetch('148201291317772288').then((user) => {
		// 	user.send('Hello there I am online now!');
		// });
	},
};
