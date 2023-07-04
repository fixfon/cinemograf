import { ICategory } from './ICategory';
import { IGenre } from './IGenre';

interface IMovie {
	title: string;
	imdbId: string;
	imdbRating: string;
	releaseYear: number;
	categories: string[];
	genres: string[];
	coverImage: string;
	emojiOutput: string;
	aiOutput: string;
}
