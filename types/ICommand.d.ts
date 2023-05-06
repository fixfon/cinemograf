import {
	CommandInteraction,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
} from 'discord.js';

interface ICommand {
	data:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| ContextMenuCommandBuilder;
	adminOnly?: boolean;
	execute(interaction: CommandInteraction): Promise<void> | void;
}

export { ICommand };
