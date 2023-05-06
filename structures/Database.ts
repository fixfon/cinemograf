import { Movie, PrismaClient, Role } from '@prisma/client';

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

interface ICreateMovie {
	title: string;
	imdbId: string;
	imdbRating: string;
	releaseYear: number;
	coverImage: string;
	aiOutput: string;
	emojiOutput: string;
	genres: string[];
	categories: string[];
}

interface IJsonMovie {
	title: string;
	releaseYear: number;
	genres: string;
	imdbId: string;
	imdbRating: string;
	emojiOutput: string;
	coverImage: string;
	aiOutput: string;
}

class Database {
	public prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async getAllCategories() {
		return await this.prisma.category.findMany();
	}

	async createCategory(name: string) {
		return await this.prisma.category.create({
			data: {
				name,
			},
		});
	}

	async getAllGenres() {
		return await this.prisma.genre.findMany();
	}

	async createGenre(name: string) {
		return await this.prisma.genre.create({
			data: {
				name,
			},
		});
	}

	async updateAllMovieGenres(genreList: string[][]) {
		const movieIds = await this.prisma.movie.findMany({
			select: {
				id: true,
			},
		});

		const movieIdList = movieIds.map((movie) => movie.id);

		return await this.prisma.movie.updateMany({
			data: {
				
			}
		});
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

	async getMovieByImdbId(imdbId: string) {
		return await this.prisma.movie.findFirst({
			where: {
				imdbId: imdbId,
			},
		});
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
	}: ICreateMovie) {
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
					connect: [...genreIds.map((genre) => ({ id: genre.id }))],
				},
				MovieCategories: {
					connect: [...categoryIds.map((category) => ({ id: category.id }))],
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
