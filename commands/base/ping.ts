import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { ICommand } from '../../types/ICommand';
import { database } from '../../structures/Database';
import * as movieGenres from './movieGenres.json';

const ping: ICommand = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides information about the user.'),
	adminOnly: false,
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply();

		await database.updateAllMovieGenres(movieGenres);
		await interaction.editReply(
			`This command was run by ${interaction.user.username}, who joined on ${interaction.member}.`
		);
	},
};

export default ping;
