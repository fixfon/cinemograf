import {
	CommandInteraction,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
} from 'discord.js';

interface ICommand {
	data: SlashCommandBuilder | ContextMenuCommandBuilder;
	adminOnly?: boolean;
	execute(interaction: CommandInteraction): Promise<void> | void;
}

export { ICommand };
