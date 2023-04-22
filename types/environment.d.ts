export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			DISCORD_CLIENT_ID: string;
			OPENAI_KEY_DEV: string;
			OPENAI_KEY_PROD: string;
			OPENAI_ORG_ID: string;
			NOTION_TOKEN: string;
			NOTION_DATABASE_ID: string;
			DEVELOPER_ID_LIST: string[];
			SUPPORT_SERVER_INVITE: string;
			SUPPORT_SERVER_ID: string;
		}
	}
}
