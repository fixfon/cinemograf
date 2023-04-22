import { Events } from 'discord.js';
import { Cinemograf } from '../structures/Cinemograf';
import type { IEvent } from '../types/IEvent';

const error: IEvent = {
	name: Events.Error,
	once: false,
	execute(bot: Cinemograf, error: Error) {
		console.log(`Error! ${error}`);
		// client.users.fetch('148201291317772288').then((user) => {
		// 	user.send(`An error occured! ${error}`);
		// });
	},
};

export default error;