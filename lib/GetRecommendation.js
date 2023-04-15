const { Configuration, OpenAIApi } = require('openai');

module.exports = async (randomFilmList) => {
	const configuration = new Configuration({
		apiKey: process.env.OPENAI_KEY,
	});
	const openai = new OpenAIApi(configuration);

	const systemPrompt =
		'Sen tüm filmleri izledin. Kullanıcı tarafından sana verilen film isimleri listesindeki filmleri spoiler vermeden sadece bir cümleyle çarpıcı şekilde özetleyerek Türkçe yanıt olarak [{film: Film Adı, genre: genre, response: Yanıtın}] şeklinde JSON array döndüreceksin.';

	const userPrompts = randomFilmList.map((film) => {
		return `film: ${film.title}\n genre: ${film.genre.join(',')}\n`;
	});

	try {
		const completion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: userPrompts.join('\n'),
				},
			],
		});
		const response = JSON.parse(completion.data.choices[0].message.content);

		// console.log(response);

		return response;
	} catch (error) {
		if (error.response) {
			console.log(error.response.status);
			console.log(error.response.data);
		} else {
			console.log(error.message);
		}

		return false;
	}
};
