import { join } from 'path';
import { readFileSync } from 'fs';
import { IGenre } from '../types/IGenre';

export function getAllGenres(): IGenre[] {
	const genres: IGenre[] = JSON.parse(
		readFileSync(join(__dirname, '../data/genres.json'), 'utf-8')
	);

	return genres;
}
