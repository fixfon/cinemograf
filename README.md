# Movie Recommendation Bot for Discord

## Stack

- Discord.js
- Notion Databases
- OpenAI API

## Run Steps

- Install Dependencies
```js
npm install
yarn install
pnpm install
```

- Create .env File
```
DISCORD_TOKEN=""
DISCORD_APPID=""
OPENAI_KEY=""
NOTION_TOKEN=""
NOTION_DB_ID=""
```

- Deploy Global Commands to Discord App
```
node run ./lib/DeployCommands.js
```

- Run Discord Client
```
npm run bot
pnpm bot
yarn bot
```

- Test Your Command
```
/film-oner
```
