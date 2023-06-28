import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { writeFileSync } from 'fs';

interface IGenre {
	id: number;
	name: string;
}

interface ICategory {
	id: number;
	name: string;
}

class FetchDb {
	public prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async getAllCategories() {
		const res = await this.prisma.category.findMany();
		return res.map((category) => {
			return {
				id: category.id,
				name: category.name,
			};
		});
	}

	async getAllGenres() {
		const res = await this.prisma.genre.findMany();
		return res.map((genre) => {
			return {
				id: genre.id,
				name: genre.name,
			};
		});
	}

	async fetchDb() {
		const genres: IGenre[] = await this.getAllGenres();
		const categories: ICategory[] = await this.getAllCategories();

		writeFileSync(
			join(__dirname, '../data/genres.json'),
			JSON.stringify(genres)
		);
		writeFileSync(
			join(__dirname, '../data/categories.json'),
			JSON.stringify(categories)
		);
	}
}

const fetchDb = new FetchDb();

fetchDb.fetchDb();
