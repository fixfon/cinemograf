import { CommandInteraction, Events } from 'discord.js';
import { Cinemograf } from '~/structures/Cinemograf';

module.exports = {
	name: Events.InteractionCreate,
	async execute(bot: Cinemograf, interaction: CommandInteraction) {
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
