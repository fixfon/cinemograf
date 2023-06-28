import { writeFileSync } from 'fs';
import { join } from 'path';
import { IGenre } from '../types/IGenre';

const updateGenres = async (genres: IGenre[]) => {
	writeFileSync(join(__dirname, '../data/genres.json'), JSON.stringify(genres));
};

export default updateGenres;