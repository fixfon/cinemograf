import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import type { ICommand } from '../../types/ICommand';
import { fetchSheet } from '../../lib/fetchSheet';

const addBulkMovie: ICommand = {
	data: new SlashCommandBuilder()
		.setName('add-bulk-movie')
		.setDescription('Create movies added into the spreadsheet.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	adminOnly: true,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const sheetData = await fetchSheet.getSheetData();
		if (!sheetData) {
			await interaction.editReply('No data found.');
			return;
		}
		await interaction.editReply(
			`Created ${JSON.stringify(sheetData, null, 0)} movies.`
		);
	},
};

export default addBulkMovie;
