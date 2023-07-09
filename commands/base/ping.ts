import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { ICommand } from '../../types/ICommand';
import { openAi } from '../../structures/OpenAI';

const ping: ICommand = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides information about the user.'),
	// .addStringOption((option) =>
	// 	option
	// 		.setName('name')
	// 		.setDescription('Your name')
	// 		.addChoices(
	// 			...genres.map((genre) => {
	// 				return {
	// 					name: genre.name,
	// 					value: genre.name,
	// 				};
	// 			})
	// 		)
	// ),
	adminOnly: false,
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply();

		const response = await openAi.requestRecomendation(
			'Inception',
			['Action', 'Adventure', 'Sci-Fi'],
			'ai'
		);

		await interaction.editReply(
			`This command was run by ${
				interaction.user.username
			}, who joined on ${JSON.stringify(response, null, 2)}.`
		);
	},
};

export default ping;
