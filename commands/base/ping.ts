import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { ICommand } from '../../types/ICommand';

const ping: ICommand = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides information about the user.'),
	adminOnly: false,
	async execute(interaction: CommandInteraction) {
		console.log('interaction', interaction);
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply(
			`This command was run by ${interaction.user.username}, who joined on ${interaction.member}.`
		);
	},
};

export default ping;
