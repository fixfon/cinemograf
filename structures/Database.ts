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
			// where: {
			// 	AND: {
			// 		MovieGenres: {
			// 			some: {
			// 				Genre: {
			// 					name: genre !== '' ? genre : undefined,
			// 				},
			// 			},
			// 		},
			// 		MovieCategories: {
			// 			some: {
			// 				Category: {
			// 					name: category !== '' ? category : undefined,
			// 				},
			// 			},
			// 		},
			// 	},
			// },
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
			movies.forEach(async (movie) => {
				await this.prisma.movie.create({
					data: {
						title: movie.title,
						imdbId: movie.imdbId,
						imdbRating: movie.imdbRating,
						releaseYear: movie.releaseYear,
						coverImage: movie.coverImage,
						aiOutput: movie.aiOutput,
						emojiOutput: movie.emojiOutput,
						MovieGenres: {
							createMany: {
								data: [
									...genreIds
										.filter((genre) => movie.genres.includes(genre.name))
										.map((genre) => {
											return {
												genreId: genre.id,
											};
										}),
								],
								skipDuplicates: true,
							},
						},
						MovieCategories: {
							createMany: {
								data: [
									...categoryIds
										.filter((category) =>
											movie.categories.includes(category.name)
										)
										.map((category) => {
											return {
												categoryId: category.id,
											};
										}),
								],
								skipDuplicates: true,
							},
						},
					},
					include: {
						MovieGenres: true,
						MovieCategories: true,
					},
				});
			});
			return;
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
