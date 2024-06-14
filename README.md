# Dev Setup

## Prereqs
* NVM
* Docker

## Commands
| Command | Description |
| - | - |
| `nvm use --lts` | Use the same nodejs version as our app. |
| `docker compose up` | Run dependencies. |
| `npx prisma migrate reset` | (Re-)initialize the db and seed it. |
| `npx prisma generate` | Generate new typings (without resetting the db). |
| `npx prisma migrate dev [--create-only]` | Generate a new db migration. `--create-only` will generate an empty or invalid migration that you can modify/fix. |
| `npm run dev` | Start the app in dev mode. |
