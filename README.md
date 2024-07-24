# Dev Setup

## Prereqs

- NVM
- Docker
- VS Code (Install all recommended extensions)

## Commands

| Command                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `nvm use --lts`            | Use the same nodejs version as our app.          |
| `docker compose up`        | Run dependencies.                                |
| `npx prisma migrate reset` | (Re-)initialize the db and seed it.              |
| `npx prisma generate`      | Generate new typings (without resetting the db). |
| `npx prisma migrate dev`   | Generate a new db migration and apply it.        |
| `npm run dev`              | Start the app in dev mode.                       |

## First run instructions

0. Install the Prereqs
1. Set `node` to the correct version
   ```bash
   nvm use --lts
   ```
2. Copy `.env.template` to `.env`
3. Modify the section of your `.env` file marked "ADD YOUR INFORMATION HERE" to seed your developer credentials.
4. Start the dependencies - The containers are using `Host network mode` which is currently a Beta feature in Docker desktop so you may need to activate it first, more info [Here](https://docs.docker.com/network/drivers/host/)
   ```bash
   docker compose up
   ```
5. Initialize the database
   ```bash
   npx prisma migrate reset
   ```
6. Log into the app with the credentials in your `.env` file. You will be in the "SYSTEM" administration account looking at the "Accounts" page, where you can see all accounts in the application. Click the 🔄 icon buttons to apply the data model template to each account.
7. Select your account from the dropdown in the navbar to impersonate that account.
8. You can now use the application as a customer.
