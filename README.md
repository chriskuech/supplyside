
# SupplySide

## Projects

See the READMEs in each project for more information.

- [API](./api/README.md) - backend called by the app
- [App](./app/README.md) - nextjs app
- [Model](./model/README.md) - common data types and dependent utilities

`API` produces code-genned types and routes for the `App` to consume. `App` calls the `API` to perform actions using service-to-service authentication.


## Setup

### Prereqs

- NVM
- VS Code (Install all recommended extensions)


### Running the system

0. Run `nvm use --lts` to use the same nodejs version as our app.
1. In `app` and `api`, copy `.env.template` to `.env` and update the values.
2. In each project, run `npm install`.
3. In `api`, run `npx prisma migrate reset` to reset the db.
4. In `api`, run `npm run gen`.
5. In `api`, run `docker compose up`.
6. In `app` and `api`, run `npm run dev`.
