import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import type { ICommand } from '../../types/ICommand';
import { database } from '../../structures/Database';

const createGenre: ICommand = {
	data: new SlashCommandBuilder()
		.setName('crate-genre')
		.setDescription('Creates genre.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) =>
			option
				.setName('genre')
				.setDescription('Enter genre name')
				.setRequired(true)
		),
	adminOnly: true,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const genre = interaction.options.getString('genre');

		if (!genre) return;

		const res = await database.createGenre(genre);
		console.log('res', res);
		await interaction.editReply(
			`Created a genre with name ${genre} on database by ${interaction.member}`
		);
	},
};

export default createGenre;
