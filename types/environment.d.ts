export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			DISCORD_TOKEN: string;
			DISCORD_CLIENT_ID: string;
			OPENAI_KEY_DEV: string;
			OPENAI_KEY_PROD: string;
			OPENAI_ORG_ID: string;
			DEVELOPER_ID_LIST: string[];
			SUPPORT_SERVER_INVITE: string;
			SUPPORT_SERVER_ID: string;
			GOOGLE_CLIENT_ID: string;
			GOOGLE_SERVICE_ACCOUNT: string;
			GOOGLE_SERVICE_PRIVATE: string;
			GOOGLE_SERVICE_SCOPE: string;
			GOOGLE_SPREADSHEET_ID: string;
			GOOGLE_SHEET_NAME: string;
			AI_OUTPUT_PROMPT: string;
			EMOJI_OUTPUT_PROMPT: string;
		}
	}
}
