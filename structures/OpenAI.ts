import { Configuration, OpenAIApi } from 'openai';

class OpenAI {
	private readonly AI_OUTPUT_PROMPT = process.env.AI_OUTPUT_PROMPT;
	private readonly EMOJI_OUTPUT_PROMPT = process.env.EMOJI_OUTPUT_PROMPT;
	private readonly OPENAI_KEY = process.env.OPENAI_KEY_PROD;
	private readonly OPENAI_ORG_ID = process.env.OPENAI_ORG_ID;

	private openAiClient: OpenAIApi;

	constructor() {
		const config = new Configuration({
			organization: this.OPENAI_ORG_ID,
			apiKey: this.OPENAI_KEY,
		});

		this.openAiClient = new OpenAIApi(config);
	}

	private async createChatCompletion(
		type: 'ai' | 'emoji',
		prompt: string,
		temperature = 1.0,
		topP = 1
	) {
		const response = await this.openAiClient.createChatCompletion({
			model: 'gpt-4-0613',
			temperature,
			top_p: topP,
			messages: [
				{
					role: 'system',
					content:
						type === 'ai' ? this.AI_OUTPUT_PROMPT : this.EMOJI_OUTPUT_PROMPT,
				},
				{ role: 'user', content: prompt },
			],
			functions: [
				{
					name: 'get_output_list',
					description:
						'Get the desired output list as stated in the system prompt.',
					parameters: {
						type: 'object',
						properties: {
							output: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										movieName: {
											type: 'string',
											description:
												'The name of the movie provided from the user.',
										},
										output: {
											type: 'string',
											description: 'The output of the AI.',
										},
									},
								},
							},
						},
						required: ['output'],
					},
				},
			],

			function_call: { name: 'get_output_list' },
		});

		return response.data;
	}

	public async requestRecomendation(
		movieTitle: string,
		movieGenres: string[],
		type: 'ai' | 'emoji'
	) {
		const prompt = `Movie: ${movieTitle}\nGenres: ${movieGenres.join(', ')}\n`;
		const response = await this.createChatCompletion(type, prompt);

		if (!response.choices[0].message?.function_call?.arguments) return null;
		return JSON.parse(response.choices[0].message?.function_call?.arguments)
			.output;
	}
}

export const openAi = new OpenAI();
