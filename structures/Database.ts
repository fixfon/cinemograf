import { PrismaClient, Role } from '@prisma/client';
import updateGenres from '../lib/updateGenres';
import updateCategories from '../lib/updateCategories';
import { IMovie } from '../types/IMovie';
import { getAllGenres } from '../lib/getAllGenres';
import { getAllCategories } from '../lib/getAllCategories';

interface IEditMovie {
	id: number;
	title?: string;
	imdbId?: string;
	imdbRating?: string;
	releaseYear?: number;
	coverImage?: string;
	aiOutput?: string;
	emojiOutput?: string;
	genres?: string[];
	categories?: string[];
}

class Database {
	public prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async createCategory(name: string) {
		await this.prisma.category.create({
			data: {
				name,
			},
		});

		const allCategories = await this.prisma.category.findMany({
			select: {
				id: true,
				name: true,
			},
		});

		updateCategories(allCategories);
	}

	async createBulkCategories(name: string[]) {
		await this.prisma.category.createMany({
			data: name.map((name) => {
				return {
					name,
				};
			}),
			skipDuplicates: true,
		});

		const allCategories = await this.prisma.category.findMany({
			select: {
				id: true,
				name: true,
			},
		});

		updateCategories(allCategories);
	}

	async createGenre(name: string) {
		await this.prisma.genre.create({
			data: {
				name,
			},
		});

		const allGenres = await this.prisma.genre.findMany({
			select: {
				id: true,
				name: true,
			},
		});

		updateGenres(allGenres);
	}

	async createBulkGenres(name: string[]) {
		await this.prisma.genre.createMany({
			data: name.map((name) => {
				return {
					name,
				};
			}),
			skipDuplicates: true,
		});

		const allGenres = await this.prisma.genre.findMany({
			select: {
				id: true,
				name: true,
			},
		});

		updateGenres(allGenres);
	}

	async getRandomThreeMovies(genre = '', category = '') {
		const allMovieIdObject = await this.prisma.movie.findMany({
			select: {
				id: true,
			},
		});

		const allMovieIds = allMovieIdObject.map((movie) => movie.id);
		const randomMovieIds = allMovieIds
			.sort(() => Math.random() - Math.random())
			.slice(0, 3);

		return await this.prisma.movie.findMany({
			where: {
				id: {
					in: randomMovieIds,
				},
			},
		});
	}

	async getAllMovies() {
		return await this.prisma.movie.findMany({
			select: {
				id: true,
				imdbId: true,
			},
		});
	}

	async getMovieByImdbId(imdbId: string) {
		return await this.prisma.movie.findFirst({
			where: {
				imdbId: imdbId,
			},
		});
	}

	async createBulkMovies(movies: IMovie[]) {
		const genreIds = await this.prisma.genre.findMany({
			where: {
				name: {
					in: movies.map((movie) => movie.genres).flat(),
				},
			},
		});

		const categoryIds = await this.prisma.category.findMany({
			where: {
				name: {
					in: movies.map((movie) => movie.categories).flat(),
				},
			},
		});

		try {
			// Solution #1: upsert many with transaction

			// await this.prisma.$transaction(
			// 	movies.map((movie) => {
			// 		return this.prisma.movie.upsert({
			// 			where: {
			// 				imdbId: movie.imdbId,
			// 			},
			// 			update: {},
			// 			create: {
			// 				title: movie.title,
			// 				imdbId: movie.imdbId,
			// 				imdbRating: movie.imdbRating,
			// 				releaseYear: movie.releaseYear,
			// 				coverImage: movie.coverImage,
			// 				aiOutput: movie.aiOutput,
			// 				emojiOutput: movie.emojiOutput,
			// 				MovieGenres: {
			// 					createMany: {
			// 						data: [
			// 							...genreIds
			// 								.filter((genre) => movie.genres.includes(genre.name))
			// 								.map((genre) => {
			// 									return {
			// 										genreId: genre.id,
			// 									};
			// 								}),
			// 						],
			// 						skipDuplicates: true,
			// 					},
			// 				},
			// 				MovieCategories: {
			// 					createMany: {
			// 						data: [
			// 							...categoryIds
			// 								.filter((category) =>
			// 									movie.categories.includes(category.name)
			// 								)
			// 								.map((category) => {
			// 									return {
			// 										categoryId: category.id,
			// 									};
			// 								}),
			// 						],
			// 						skipDuplicates: true,
			// 					},
			// 				},
			// 			},
			// 			include: {
			// 				MovieGenres: true,
			// 				MovieCategories: true,
			// 			},
			// 		});
			// 	})
			// );

			// Solution #2
			// movies.forEach(async (movie) => {
			// 	await this.prisma.movie.upsert({
			// 		where: {
			// 			imdbId: movie.imdbId,
			// 		},
			// 		update: {},
			// 		create: {
			// 			title: movie.title,
			// 			imdbId: movie.imdbId,
			// 			imdbRating: movie.imdbRating,
			// 			releaseYear: movie.releaseYear,
			// 			coverImage: movie.coverImage,
			// 			aiOutput: movie.aiOutput,
			// 			emojiOutput: movie.emojiOutput,
			// 			MovieGenres: {
			// 				createMany: {
			// 					data: [
			// 						...genreIds
			// 							.filter((genre) => movie.genres.includes(genre.name))
			// 							.map((genre) => {
			// 								return {
			// 									genreId: genre.id,
			// 								};
			// 							}),
			// 					],
			// 					skipDuplicates: true,
			// 				},
			// 			},
			// 			MovieCategories: {
			// 				createMany: {
			// 					data: [
			// 						...categoryIds
			// 							.filter((category) =>
			// 								movie.categories.includes(category.name)
			// 							)
			// 							.map((category) => {
			// 								return {
			// 									categoryId: category.id,
			// 								};
			// 							}),
			// 					],
			// 					skipDuplicates: true,
			// 				},
			// 			},
			// 		},
			// 		include: {
			// 			MovieGenres: true,
			// 			MovieCategories: true,
			// 		},
			// 	});
			// });

			// Solution #3 - the fastest one so far

			const count = await this.prisma.movie.createMany({
				skipDuplicates: true,
				data: [
					...movies.map((movie) => {
						return {
							title: movie.title,
							imdbId: movie.imdbId,
							imdbRating: movie.imdbRating,
							releaseYear: movie.releaseYear,
							coverImage: movie.coverImage,
							aiOutput: movie.aiOutput,
							emojiOutput: movie.emojiOutput,
						};
					}),
				],
			});

			const allMovies = await this.getAllMovies();

			let movieCategories: {
				movieId: number;
				categoryId: number;
			}[] = [];

			let movieGenres: {
				movieId: number;
				genreId: number;
			}[] = [];

			movies.forEach((movie) => {
				const movieId = allMovies.find((m) => m.imdbId === movie.imdbId);
				if (!movieId) return;

				movie.categories.forEach((category) => {
					movieCategories.push({
						movieId: movieId.id,
						categoryId: categoryIds.find((c) => c.name === category)
							?.id as number,
					});
				});

				movie.genres.forEach((genre) => {
					movieGenres.push({
						movieId: movieId.id,
						genreId: genreIds.find((g) => g.name === genre)?.id as number,
					});
				});
			});

			if (movieCategories && movieCategories.length > 0) {
				await this.prisma.movieCategories.createMany({
					skipDuplicates: true,
					data: movieCategories,
				});
			}

			if (movieGenres && movieGenres.length > 0) {
				await this.prisma.movieGenres.createMany({
					skipDuplicates: true,
					data: movieGenres,
				});
			}

			return count.count;
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async createMovie({
		title,
		imdbId,
		imdbRating,
		releaseYear,
		coverImage,
		aiOutput,
		emojiOutput,
		genres,
		categories,
	}: IMovie) {
		const allGenres = getAllGenres();
		const genreIds = allGenres
			.filter((genre) => genres.includes(genre.name))
			.map((genre) => genre.id);

		const allCategories = getAllCategories();

		const categoryIds = allCategories
			.filter((category) => categories.includes(category.name))
			.map((category) => category.id);

		return await this.prisma.movie.create({
			data: {
				title,
				imdbId,
				imdbRating,
				releaseYear,
				coverImage,
				aiOutput,
				emojiOutput,
				MovieGenres: {
					createMany: {
						data: [...genreIds.map((genre) => ({ genreId: genre }))],
					},
				},
				MovieCategories: {
					createMany: {
						data: [
							...categoryIds.map((category) => ({ categoryId: category })),
						],
					},
				},
			},
			include: {
				MovieGenres: true,
				MovieCategories: true,
			},
		});
	}

	async editMovie({
		id,
		title,
		imdbId,
		imdbRating,
		releaseYear,
		coverImage,
		aiOutput,
		emojiOutput,
		genres,
		categories,
	}: IEditMovie) {
		const genreIds = await this.prisma.genre.findMany({
			where: {
				name: {
					in: genres,
				},
			},
		});

		const categoryIds = await this.prisma.category.findMany({
			where: {
				name: {
					in: categories,
				},
			},
		});

		return await this.prisma.movie.update({
			where: {
				id: id,
			},
			data: {
				title,
				imdbId,
				imdbRating,
				releaseYear,
				coverImage,
				aiOutput,
				emojiOutput,
				MovieGenres: {
					set: genreIds
						? [...genreIds.map((genre) => ({ id: genre.id }))]
						: undefined,
				},
				MovieCategories: {
					set: categoryIds
						? [...categoryIds.map((category) => ({ id: category.id }))]
						: undefined,
				},
			},
			include: {
				MovieGenres: true,
				MovieCategories: true,
			},
		});
	}

	async upsertUser(id: string, username: string, role = 'USER' as Role) {
		return await this.prisma.user.upsert({
			where: {
				id: id,
			},
			update: {},
			create: {
				id: id,
				username: username,
				role: role,
			},
		});
	}

	async setUserRole(id: string, role: Role) {
		return await this.prisma.user.update({
			where: {
				id: id,
			},
			data: {
				role: role,
			},
		});
	}
}

export const database = new Database();
