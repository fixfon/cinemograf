import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
	EmbedBuilder,
} from 'discord.js';
import type { ICommand } from '../../types/ICommand';
import { fetchSheet } from '../../lib/fetchSheet';
import { IMovie } from '../../types/IMovie';
import { getAllCategories } from '../../lib/getAllCategories';
import { getAllGenres } from '../../lib/getAllGenres';
import { database } from '../../structures/Database';

const getUniqueCategories = (movies: IMovie[]) => {
	const categories: string[] = [];
	movies.forEach((movie) => {
		movie.categories.forEach((category) => {
			if (!categories.includes(category)) {
				categories.push(category);
			}
		});
	});
	return categories;
};

const getUniqueGenres = (movies: IMovie[]) => {
	const genres: string[] = [];
	movies.forEach((movie) => {
		movie.genres.forEach((genre) => {
			if (!genres.includes(genre)) {
				genres.push(genre);
			}
		});
	});
	return genres;
};

const getNonExistingCategories = (categories: string[]) => {
	const allCategories = getAllCategories();
	const nonExistingCategories = categories.filter((category) => {
		return !allCategories.find(
			(c) => c.name.toLowerCase() === category.toLowerCase()
		);
	});
	return nonExistingCategories;
};

const getNonExistingGenres = (genres: string[]) => {
	const allGenres = getAllGenres();
	const nonExistingGenres = genres.filter((genre) => {
		return !allGenres.find((g) => g.name.toLowerCase() === genre.toLowerCase());
	});
	return nonExistingGenres;
};

const getNonExistingMovies = async (movies: IMovie[]) => {
	const allMovies = await database.getAllMovies();
	const nonExistingMovies = movies.filter((movie) => {
		return !allMovies.find((m) => m.imdbId === movie.imdbId);
	});
	return nonExistingMovies;
};

const createBulkMovie: ICommand = {
	data: new SlashCommandBuilder()
		.setName('create-bulk-movie')
		.setDescription('Create movies added into the spreadsheet.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	adminOnly: true,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const author = interaction.user;

		const replyEmbed = new EmbedBuilder()
			.setTitle('Create Bulk Movie')
			.setDescription('Creating movies added into the spreadsheet.')
			.setColor('Green')
			.setTimestamp()
			.setFooter({
				text: `Requested by ${author.username}`,
				iconURL: `${author.displayAvatarURL()}`,
			});

		await interaction.editReply({ embeds: [replyEmbed] });

		// read and validate the sheet data
		const response = await fetchSheet.getSheetData();
		if (!response) {
			await interaction.editReply('No data found.');
			return;
		}

		const bulkMovies: IMovie[] = response.map((movie) => {
			return {
				title: movie[0],
				imdbId: movie[1],
				releaseYear: parseInt(movie[2]),
				imdbRating: movie[3],
				categories:
					movie[4].length > 0
						? movie[4]
								.replace('[', '')
								.replace(']', '')
								.replace(/'/g, '')
								.split(', ')
						: [],
				genres:
					movie[5].length > 0
						? movie[5]
								.replace('[', '')
								.replace(']', '')
								.replace(/'/g, '')
								.split(', ')
						: [],
				coverImage: movie[6],
				emojiOutput: movie[7],
				aiOutput: movie[8],
			};
		});

		// check and create categories and genres
		const categories = getUniqueCategories(bulkMovies);
		const genres = getUniqueGenres(bulkMovies);
		const nonExistingCategories = getNonExistingCategories(categories);
		const nonExistingGenres = getNonExistingGenres(genres);
		const nonExistingMovies = await getNonExistingMovies(bulkMovies);

		try {
			if (nonExistingCategories.length > 0) {
				await database.createBulkCategories(nonExistingCategories);
				replyEmbed.addFields({
					name: 'Created Categories',
					value: `${nonExistingCategories.join(', ')}`,
					inline: true,
				});
			}

			if (nonExistingGenres.length > 0) {
				await database.createBulkGenres(nonExistingGenres);
				replyEmbed.addFields({
					name: 'Created Genres',
					value: `${nonExistingGenres.join(', ')}`,
					inline: true,
				});
			}

			await interaction.editReply({
				embeds: [replyEmbed],
			});

			if (nonExistingMovies.length > 0) {
				const createdCount = await database.createBulkMovies(bulkMovies);
				const movieTitleString = nonExistingMovies
					.map((m) => m.title)
					.join('\n');

				// embed fields have a limit of 1024 characters
				// so we need to split the string into chunks but every movie ends with \n

				const chunkSize = 1024;
				const chunks: string[] = [];

				for (let i = 0; i < movieTitleString.length; i += chunkSize) {
					// be sure to chunk ends with \n so we don't cut the movie title to another chunk.

					const chunk = movieTitleString.substring(i, i + chunkSize);
					const lastChar = chunk[chunk.length - 1];

					if (lastChar !== '\n') {
						const lastNewLineIndex = chunk.lastIndexOf('\n');
						const chunkWithoutLastLine = chunk.substring(0, lastNewLineIndex);
						chunks.push(chunkWithoutLastLine);
					} else {
						chunks.push(chunk);
					}
				}

				if (chunks) {
					const chunkEmbedArray = [];

					for (let i = 0; i < chunks.length; i++) {
						const chunk = chunks[i];

						const chunkEmbed = new EmbedBuilder()
							.setTitle('Create Bulk Movie')
							.setDescription(`A total of ${createdCount} movies were created.`)
							.setColor('Green')
							.setTimestamp()
							.setFooter({
								text: `Requested by ${author.username}`,
								iconURL: `${author.displayAvatarURL()}`,
							})
							.setFields({
								name: `Created Movies #${i + 1}`,
								value: `${chunk}`,
							});

						chunkEmbedArray.push(chunkEmbed);
					}

					await interaction.followUp({ embeds: [...chunkEmbedArray] });
				} else {
					replyEmbed.setFields({
						name: 'Created Movies',
						value: `${nonExistingMovies.map((m) => m.title).join('\n')}`,
						inline: true,
					});

					await interaction.editReply({
						embeds: [replyEmbed],
					});
				}
			}
		} catch (error: any) {
			await interaction.editReply(`Error occured: ${error.message}`);
		}
	},
};

export default createBulkMovie;
