import { Events } from 'discord.js';
import { Cinemograf } from '~/structures/Cinemograf';

const error: IEvent = {
	name: Events.Error,
	execute(bot: Cinemograf, error: Error) {
		console.log(`Error! ${error}`);
		// client.users.fetch('148201291317772288').then((user) => {
		// 	user.send(`An error occured! ${error}`);
		// });
	},
};
