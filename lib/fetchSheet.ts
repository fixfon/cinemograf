import { google } from 'googleapis';

class FetchSheet {
	private readonly spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
	private readonly SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT;
	private readonly SERVICE_PRIVATE = process.env.GOOGLE_SERVICE_PRIVATE;
	private readonly SERVICE_SCOPE = process.env.GOOGLE_SERVICE_SCOPE;
	private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
	public oAuth;

	constructor() {
		this.oAuth = new google.auth.GoogleAuth({
			scopes: [this.SERVICE_SCOPE],
			credentials: {
				private_key: this.SERVICE_PRIVATE,
				client_email: this.SERVICE_ACCOUNT,
				audience: 'https://accounts.google.com/o/oauth2/auth',
				token_url: 'https://oauth2.googleapis.com/token',
				client_id: this.GOOGLE_CLIENT_ID,
			},
		});
	}

	async getSheetData() {
		const sheets = google.sheets({ version: 'v4', auth: this.oAuth });
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: this.spreadsheetId,
			range: 'A2:H1000',
		});
		return response.data.values;
	}
}

export const fetchSheet = new FetchSheet();
