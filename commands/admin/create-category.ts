import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import type { ICommand } from '../../types/ICommand';
import { database } from '../../structures/Database';

const createCategory: ICommand = {
	data: new SlashCommandBuilder()
		.setName('crate-category')
		.setDescription('Creates category.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) =>
			option
				.setName('category')
				.setDescription('Enter category name')
				.setRequired(true)
		),
	adminOnly: true,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const category = interaction.options.getString('category');

		if (!category) return;

		const res = await database.createCategory(category);
		console.log('res', res);
		await interaction.editReply(
			`Created a category with name **${category}** on database by ${interaction.member}`
		);
	},
};

export default createCategory;
