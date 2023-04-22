import { Events } from 'discord.js';
import { Cinemograf } from '../structures/Cinemograf';
import type { IEvent } from '../types/IEvent';

const clientReady: IEvent = {
	name: Events.ClientReady,
	once: true,
	execute(bot: Cinemograf) {
		console.log(`Ready! Logged in as ${bot.client?.user?.tag}`);
		// client.users.fetch('148201291317772288').then((user) => {
		// 	user.send('Hello there I am online now!');
		// });
	},
};

export default clientReady;
