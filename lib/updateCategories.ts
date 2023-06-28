import { writeFileSync } from 'fs';
import { join } from 'path';
import { ICategory } from '../types/ICategory';

const updateCategories = async (categories: ICategory[]) => {
	writeFileSync(
		join(__dirname, '../data/categories.json'),
		JSON.stringify(categories)
	);
};

export default updateCategories;
