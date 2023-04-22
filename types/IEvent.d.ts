import { Cinemograf } from '~/structures/Cinemograf';

export interface IEvent {
	name: string;
	once: boolean;
	execute(client: Cinemograf, ...args: any[]): Promise<void> | void;
}
