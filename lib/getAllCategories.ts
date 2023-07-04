import { join } from 'path';
import { readFileSync } from 'fs';
import { ICategory } from '../types/ICategory';

export function getAllCategories(): ICategory[] {
	const categories: ICategory[] = JSON.parse(
		readFileSync(join(__dirname, '../data/categories.json'), 'utf-8')
	);

	return categories;
}
