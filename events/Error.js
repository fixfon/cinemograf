const { Events } = require('discord.js');

module.exports = {
	name: Events.Error,
	execute(client, error) {
		console.log(`Error! ${error}`);
		// client.users.fetch('148201291317772288').then((user) => {
		// 	user.send(`An error occured! ${error}`);
		// });
	},
};
