const fs = require('node:fs');
const path = require('node:path');

module.exports = (client) => {
	const eventFolderPath = path.join(__dirname, '..', 'events');
	const eventFiles = fs.readdirSync(eventFolderPath);

	for (const eventFileName of eventFiles) {
		const eventFilePath = path.join(eventFolderPath, eventFileName);
		const event = require(eventFilePath);
		event.name == 'ready'
			? client.once(event.name, async () => await event.execute(client))
			: client.on(
					event.name,
					async (...args) => await event.execute(client, ...args)
			  );
	}
};
