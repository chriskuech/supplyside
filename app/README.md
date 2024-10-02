# Dev Setup

## Commands

| Command                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `npm run dev`              | Start the next server in dev mode.               |
| `npm run check:watch`      | Run the type checker in dev mode.                |

## First run instructions

1. Copy `.env.template` to `.env`
2. Modify the section of your `.env` file marked "ADD YOUR INFORMATION HERE" to seed your developer credentials.
6. Log into the app with the credentials in your `.env` file. You will be in the "SYSTEM" administration account looking at the "Accounts" page, where you can see all accounts in the application. Click the 🔄 icon buttons to apply the data model template to each account.
7. Select your account from the dropdown in the navbar to impersonate that account.
8. You can now use the application as a customer.

## Rendering SECURITY.md to PDF

```bash
npx md-mermaid-to-pdf ./SECURITY.md --pdf-options '{ "format": "Letter", "margin": "1in" }'
```
