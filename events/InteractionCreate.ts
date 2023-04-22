import { CommandInteraction, Events } from 'discord.js';
import { Cinemograf } from '../structures/Cinemograf';
import type { IEvent } from '../types/IEvent';

const interactionCreate: IEvent = {
	name: Events.InteractionCreate,
	once: false,
	async execute(bot: Cinemograf, interaction: CommandInteraction) {
		console.log('hit interaction create');
		if (!interaction.isChatInputCommand()) return;

		const command = bot.getCommand(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};

export default interactionCreate;
