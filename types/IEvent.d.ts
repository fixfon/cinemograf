import { Cinemograf } from '../structures/Cinemograf';

interface IEvent {
	name: string;
	once: boolean;
	execute(client: Cinemograf, ...args: any[]): Promise<void> | void;
}

export { IEvent };