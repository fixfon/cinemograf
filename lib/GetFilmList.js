const { Client } = require('@notionhq/client');
require('dotenv').config();

module.exports = async () => {
	const notion = new Client({
		auth: process.env.NOTION_TOKEN,
	});

	const getDB = async (notionClient) => {
		const db = await notionClient.databases.query({
			database_id: 'a28e57c071e847a9b01682d70d88e485',
			filter: {
				property: 'Status',
				select: {
					equals: 'watchlist',
				},
			},
		});

		return db;
	};

	const filterFilmList = (db) => {
		const result = db.results.map((item) => {
			return {
				title: item.properties.Title.title[0].plain_text,
				genre: item.properties.Genre.multi_select.map((genre) => {
					return genre.name;
				}),
			};
		});

		return result;
	};

	const db = await getDB(notion);
	const filteredList = filterFilmList(db);

	return filteredList;
};
