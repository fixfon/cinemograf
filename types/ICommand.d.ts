import {
	CommandInteraction,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
} from 'discord.js';

export interface ICommand {
	data: SlashCommandBuilder | ContextMenuCommandBuilder;
	adminOnly?: boolean;
	execute(interaction: CommandInteraction): Promise<void> | void;
}
