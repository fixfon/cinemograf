import { Cinemograf } from '~/structures/Cinemograf';

const cinemografInstance = Cinemograf.getInstance();

async function start() {
	await cinemografInstance.init().catch((error) => {
		console.error('Error logging in on start: ', error);
		return process.exit(1);
	});
}

start();
