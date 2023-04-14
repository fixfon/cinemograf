const { SlashCommandBuilder } = require('discord.js');
const GetFilmList = require('../../lib/GetFilmList.js');
const GetRandomFilmList = require('../../lib/GetRandomFilmList.js');
const GetRecommendation = require('../../lib/GetRecommendation.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('film-oner')
		.setDescription(
			'Secilen kategoriye gore listeden izlenilmeyen filmlerin arasindan oneri yapar.'
		)
		.addStringOption((option) =>
			option
				.setRequired(false)
				.setName('birinci-kategori')
				.setDescription('Birinci film kategorisini seciniz. (Zorunlu Degil)')
				.addChoices(
					{ name: 'aksiyon', value: 'action' },
					{ name: 'dram', value: 'drama' },
					{ name: 'romantik', value: 'romance' },
					{ name: 'suç', value: 'crime' },
					{ name: 'belgesel', value: 'documentary' },
					{ name: 'gerilim', value: 'thriller' },
					{ name: 'bilimkurgu', value: 'sci-fi' },
					{ name: 'animasyon', value: 'animation' },
					{ name: 'gizem', value: 'mystery' },
					{ name: 'psikoloji', value: 'psychological' },
					{ name: 'komedi', value: 'comedy' }
				)
		)
		.addStringOption((option) =>
			option
				.setRequired(false)
				.setName('ikinci-kategori')
				.setDescription('Ikinci film kategorisini seciniz. (Zorunlu Degil)')
				.addChoices(
					{ name: 'aksiyon', value: 'action' },
					{ name: 'dram', value: 'drama' },
					{ name: 'romantik', value: 'romance' },
					{ name: 'suç', value: 'crime' },
					{ name: 'belgesel', value: 'documentary' },
					{ name: 'gerilim', value: 'thriller' },
					{ name: 'bilimkurgu', value: 'sci-fi' },
					{ name: 'animasyon', value: 'animation' },
					{ name: 'gizem', value: 'mystery' },
					{ name: 'psikoloji', value: 'psychological' },
					{ name: 'komedi', value: 'comedy' }
				)
		),
	async execute(interaction) {
		await interaction.deferReply();

		const birinciKategori = interaction.options.getString('birinci-kategori');
		const ikinciKategori = interaction.options.getString('ikinci-kategori');

		const filmList = await GetFilmList();
		const randomFilmList = GetRandomFilmList(
			filmList,
			birinciKategori,
			ikinciKategori
		);

		if (randomFilmList.length === 0) {
			await interaction.editReply({
				content: 'Uygun film bulunamadi.',
			});
			return;
		}

		const result = await GetRecommendation(randomFilmList);

		if (result === null) {
			await interaction.editReply({
				content: 'Uygun film bulunamadi.',
			});
			return;
		}

		const embed = {
			color: 0x0099ff,
			title: 'Film Önerileri',
			fields: result.map((film) => {
				return {
					name: film.film,
					value: `**Tür:** ${film.genre}\n**Özet:** ${film.response}`,
				};
			}),
		};

		await interaction.editReply({ embeds: [embed] });
	},
};
