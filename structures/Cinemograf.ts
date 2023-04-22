import {
	Client,
	Collection,
	GatewayIntentBits as Intent,
	Partials,
	REST,
	Routes,
} from 'discord.js';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import type { ICommand } from '../types/ICommand';
import type { IEvent } from '../types/IEvent';
dotenv.config();

const intents: Intent[] = [
	Intent.Guilds,
	Intent.GuildMembers,
	Intent.DirectMessages,
	Intent.DirectMessageTyping,
	Intent.GuildMessages,
	Intent.GuildMessageTyping,
	Intent.MessageContent,
];

const partials: Partials[] = [
	Partials.Message,
	Partials.User,
	Partials.Reaction,
	Partials.GuildMember,
];

export class Cinemograf {
	private readonly TOKEN = process.env.DISCORD_TOKEN;
	public readonly DEVELOPER_ID_LIST = process.env.DEVELOPER_ID_LIST;
	public readonly SUPPORT_SERVER_ID = process.env.SUPPORT_SERVER_ID;

	private static instance: Cinemograf;

	private rest = new REST().setToken(this.TOKEN);
	public client = new Client({ intents, partials });
	public readonly clientId = process.env.DISCORD_CLIENT_ID;
	private commands = new Collection<string, ICommand>();
	private adminCommands = new Collection<string, ICommand>();

	private constructor() {}

	static getInstance(): Cinemograf {
		if (!Cinemograf.instance) {
			Cinemograf.instance = new Cinemograf();
		}

		return Cinemograf.instance;
	}

	public async init() {
		console.log('Logging in...');
		try {
			this.setEventListeners();

			await this.client.login(this.TOKEN);
			await this.client.application?.fetch();
			console.log('Logged in!');

			await this.setCommands();
			await this.registerCommands();
		} catch (error) {
			console.error('Error logging in: ', error);
			return process.exit(1);
		}
	}

	private setEventListeners() {
		try {
			console.log('Setting event listeners...');
			const eventFolderPath = join(__dirname, '..', 'events');
			const eventFiles = readdirSync(eventFolderPath);

			for (const eventFileName of eventFiles) {
				const eventFilePath = join(eventFolderPath, eventFileName);
				const event: IEvent = require(eventFilePath).default;

				if (!event.execute) return;

				if (event.once)
					this.client.once(event.name, event.execute.bind(null, this));
				else this.client.on(event.name, event.execute.bind(null, this));
			}
			console.log('Event listeners set!');
		} catch (error) {
			console.error('Error reading events directory during startup.', error);
		}
	}

	private async setCommands() {
		try {
			console.log('Setting commands...');
			const commandFoldersPath = join(__dirname, '..', 'commands');
			const commandFolders = readdirSync(commandFoldersPath);

			for (const folder of commandFolders) {
				// Grab all the command files from the commands directory you created earlier
				const commandsPath = join(commandFoldersPath, folder);
				const commandFiles = readdirSync(commandsPath).filter((file) =>
					file.endsWith('.js')
				);
				console.log(commandFiles);
				for (const file of commandFiles) {
					console.log(file);
					const filePath = join(commandsPath, file);
					const command: ICommand = require(filePath).default;
					if ('data' in command && 'execute' in command && !command.adminOnly) {
						this.commands.set(command.data.name, command);
					} else if (
						'data' in command &&
						'execute' in command &&
						command.adminOnly
					) {
						this.adminCommands.set(command.data.name, command);
					} else {
						console.log(
							`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
						);
					}
				}
			}

			console.log('Commands set!');
		} catch (error) {
			console.error('Error reading commands directory during startup.', error);
		}
	}

	private async registerCommands() {
		try {
			console.log('Registering commands...');
			const commands = this.commands.map((command) => command.data.toJSON());
			const adminCommands = this.adminCommands.map((command) =>
				command.data.toJSON()
			);

			console.log('commands', commands);
			console.log('adminCommands', adminCommands);

			const res1 = await this.rest.put(
				Routes.applicationCommands(this.clientId),
				{
					body: commands,
				}
			);
			console.log('General commands registered!');
			console.log('res1', res1);

			const res2 = await this.rest.put(
				Routes.applicationGuildCommands(this.clientId, this.SUPPORT_SERVER_ID),
				{
					body: adminCommands,
				}
			);
			console.log('Admin commands registered!');
			console.log('res2', res2);
		} catch (error) {
			console.error('Error registering commands.', error);
		}
	}

	public getCommand(commandName: string) {
		// return whether the command is general or admin
		return (
			this.commands.get(commandName) || this.adminCommands.get(commandName)
		);
	}
}
