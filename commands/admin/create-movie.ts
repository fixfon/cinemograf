import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { ICommand } from '../../types/ICommand';
import { getAllCategories } from '../../lib/getAllCategories';
import { getAllGenres } from '../../lib/getAllGenres';
import { database } from '../../structures/Database';
import { openAi } from '../../structures/OpenAI';

const categoryList = getAllCategories();
const genreList = getAllGenres();

const createMovie: ICommand = {
	data: new SlashCommandBuilder()
		.setName('create-movie')
		.setDescription('Create single movie.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) =>
			option
				.setName('title')
				.setDescription('Title of the movie')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('imdb-id')
				.setDescription('IMDB ID of the movie')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('imdb-rating')
				.setDescription('IMDB Rating of the movie')
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('release-year')
				.setDescription('Release Year of the movie')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('cover-image')
				.setDescription('Cover Image of the movie')
				.setRequired(true)
		),
	adminOnly: true,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const author = interaction.user;

		const replyEmbed = new EmbedBuilder()
			.setTitle('Create Movie')
			.setDescription('Creating the movie...')
			.setColor('Green')
			.setTimestamp()
			.setFooter({
				text: `Requested by ${author.username}`,
				iconURL: `${author.displayAvatarURL()}`,
			});

		const title = interaction.options.getString('title', true);
		const imdbId = interaction.options.getString('imdb-id', true);
		const imdbRating = interaction.options.getString('imdb-rating', true);
		const releaseYear = interaction.options.getInteger('release-year', true);
		const coverImage = interaction.options.getString('cover-image', true);

		replyEmbed.addFields(
			{
				name: 'Title',
				value: title,
			},
			{
				name: 'IMDB ID',
				value: imdbId,
			},
			{
				name: 'IMDB Rating',
				value: imdbRating,
			},
			{
				name: 'Release Year',
				value: releaseYear.toString(),
			},
			{
				name: 'Cover Image',
				value: coverImage,
			}
		);

		await interaction.editReply({ embeds: [replyEmbed] });

		// check the movie is already in the database with the imdb id

		const movie = await database.getMovieByImdbId(imdbId);

		if (movie?.id) {
			replyEmbed.setDescription(
				'The movie is already in the database. Please try again with a different IMDB ID.'
			);
			replyEmbed.setFields([]);
			replyEmbed.setColor('Red');
			await interaction.editReply({ embeds: [replyEmbed] });
			return;
		}

		const categorySelectMenu = new StringSelectMenuBuilder()
			.setCustomId('category-select-menu')
			.setPlaceholder('Select the categories')
			.addOptions(
				...categoryList.map((category) => {
					return new StringSelectMenuOptionBuilder()
						.setLabel(category.name)
						.setValue(category.id.toString());
				})
			)
			.setMinValues(1)
			.setMaxValues(5);

		const categoryActionRow =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				categorySelectMenu
			);

		const genreSelectMenu = new StringSelectMenuBuilder()
			.setCustomId('genre-select-menu')
			.setPlaceholder('Select the genres')
			.addOptions(
				...genreList.map((genre) => {
					return new StringSelectMenuOptionBuilder()
						.setLabel(genre.name)
						.setValue(genre.id.toString());
				})
			)
			.setMinValues(1)
			.setMaxValues(5);

		const genreActionRow =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				genreSelectMenu
			);

		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Success);

		const confirmActionRow =
			new ActionRowBuilder<ButtonBuilder>().addComponents(confirm);

		replyEmbed.setDescription(
			'Creating the movie... Please select the categories and genres of the movie.'
		);

		const response = await interaction.editReply({
			embeds: [replyEmbed],
			components: [categoryActionRow, genreActionRow, confirmActionRow],
		});

		// add collector that stops when the user clicks the confirm button or after 60 seconds.

		try {
			const collector = response.createMessageComponentCollector({
				time: 60_000,
			});

			collector.on(
				'collect',
				async (i: StringSelectMenuInteraction | ButtonInteraction) => {
					await i.deferUpdate();
					if (i.customId === 'confirm') {
						collector.stop('confirmed');
					}
				}
			);

			const selectedCategories: string[] = [];
			const selectedGenres: string[] = [];

			collector.on('end', async (collected) => {
				if (
					collected.size === 0 ||
					(collected.size === 1 && collected.first()?.customId === 'confirm')
				) {
					replyEmbed.setDescription('No response. Please try again later.');
					replyEmbed.setColor('Red');

					await interaction.editReply({
						embeds: [replyEmbed],
						components: [],
					});
				} else {
					// Then check the provided categories and genres and create the movie.

					replyEmbed.setDescription(
						'Saved categories and genres of the movie. Creating it...'
					);

					collected.forEach((interaction) => {
						if (
							interaction.customId === 'category-select-menu' &&
							interaction instanceof StringSelectMenuInteraction
						) {
							interaction.values.forEach((value) => {
								const foundCatName = categoryList.find(
									(cat) => cat.id === parseInt(value)
								)?.name;
								selectedCategories.push(foundCatName || '');
							});
						} else if (
							interaction.customId === 'genre-select-menu' &&
							interaction instanceof StringSelectMenuInteraction
						) {
							interaction.values.forEach((value) => {
								const foundGenName = genreList.find(
									(gen) => gen.id === parseInt(value)
								)?.name;
								selectedGenres.push(foundGenName || '');
							});
						}
					});

					if (selectedCategories.length > 0 && selectedGenres.length > 0) {
						replyEmbed.addFields(
							{
								name: 'Categories',
								value: selectedCategories.join(', '),
							},
							{
								name: 'Genres',
								value: selectedGenres.join(', '),
							}
						);

						await interaction.editReply({
							embeds: [replyEmbed],
							components: [],
						});

						// Request aiOutput and emojiOutput from the AI.

						const aiOutput = await openAi.requestRecomendation(
							title,
							selectedGenres,
							'ai'
						);

						const emojiOutput = await openAi.requestRecomendation(
							title,
							selectedGenres,
							'emoji'
						);

						try {
							const createdMovie = await database.createMovie({
								title,
								imdbId,
								imdbRating,
								releaseYear,
								coverImage,
								categories: selectedCategories,
								genres: selectedGenres,
								aiOutput: aiOutput[0].output,
								emojiOutput: emojiOutput[0].output,
							});

							if (createdMovie.id !== undefined) {
								replyEmbed.setDescription(
									`Movie created with id: ${createdMovie.id}`
								);
								replyEmbed.addFields(
									{
										name: 'AI Output',
										value: aiOutput[0].output,
									},
									{
										name: 'Emoji Output',
										value: emojiOutput[0].output,
									}
								);
								replyEmbed.setColor('Green');
							} else {
								replyEmbed.setDescription(
									'An error occured. Please try again later.'
								);
								replyEmbed.setColor('Red');
							}

							await interaction.editReply({
								embeds: [replyEmbed],
								components: [],
							});
						} catch (error) {
							console.error(error);
							replyEmbed.setDescription(
								'An error occured. Please try again later.'
							);
							replyEmbed.setColor('Red');

							await interaction.editReply({
								embeds: [replyEmbed],
								components: [],
							});
							return;
						}
					} else {
						replyEmbed.setDescription(
							'No categories or genres selected. Please try again later.'
						);
						replyEmbed.setColor('Red');
						await interaction.editReply({
							embeds: [replyEmbed],
							components: [],
						});
					}
				}
			});
		} catch (err) {
			replyEmbed.setDescription('An error occured. Please try again later.');
			replyEmbed.setColor('Red');
			await interaction.editReply({
				embeds: [replyEmbed],
				components: [],
			});
		}
	},
};

export default createMovie;
