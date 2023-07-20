import { ActivityType, Collection, Events } from 'discord.js';
import { Cinemograf } from '../structures/Cinemograf';
import type { IEvent } from '../types/IEvent';

const clientReady: IEvent = {
	name: Events.ClientReady,
	once: true,
	execute(bot: Cinemograf) {
		console.log(`Ready! Logged in as ${bot.client?.user?.tag}`);

		const activityFunc = () => {
			const guildSize = bot.client?.guilds.cache.size;
			const userSize = bot.client?.guilds.cache.reduce(
				(acc, guild) => acc + guild.memberCount,
				0
			);
			const activity = new Collection<string, any>();
			activity.set(`${guildSize} servers`, {
				type: ActivityType.Watching,
			});
			activity.set(`${userSize} users`, {
				type: ActivityType.Watching,
			});
			activity.set('/help for commands', {
				type: ActivityType.Listening,
			});
			activity.set('Get your AI movie recommendations now!', {
				type: ActivityType.Watching,
			});
			activity.set('/recommend-movie', {
				type: ActivityType.Watching,
			});
			return activity;
		};

		let index = 0;
		setInterval(() => {
			const activityMap = activityFunc();
			const activities = Array.from(activityMap.keys());
			const types = Array.from(activityMap.values());

			if (index == activities.length) index = 0;

			bot.client?.user?.setActivity(activities[index], types[index]);

			index++;
		}, 30000);

		// client.users.fetch('148201291317772288').then((user) => {
		// 	user.send('Hello there I am online now!');
		// });
	},
};

export default clientReady;
