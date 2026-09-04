# Lucky Parking

![Lucky Parking](lucky-parking.png)

A [Hack for LA](https://www.hackforla.org/) project to help city planners and the community make informed decisions about parking politices in the City of Los Angeles.

The Lucky Parking repository is a [Turborepo](https://turbo.build/repo/docs)-powered monorepo that manages our backend, frontend, shared libraries, and data science workflows.

## Getting Started

### Prerequisites

- Install [Node.js 24](https://nodejs.org/).
- Install [pnpm 9](https://pnpm.io/).
- Fork the repository: https://github.com/hackforla/lucky-parking/fork.
- Clone your fork to your computer for local development.
- Add remote to this repository:

```bash
git remote add upstream git@github.com:hackforla/lucky-parking.git
```

### Install Dependencies

We use `pnpm` as our package manager. To install all dependencies, run:

```bash
pnpm install
```
### Configure Environment Variables

Create local environment files from the schemas for both applications:

```bash
cp apps/web/.env.schema apps/web/.env
cp apps/api/.env.schema apps/api/.env
```

Populate `apps/web/.env` with your Mapbox and LA City Data Socrata tokens. Free accounts are available from [Mapbox](https://www.mapbox.com/) and [LA City Open Data](https://data.lacity.org/login). Configure the database values in `apps/api/.env` to run the API.

Environment files may contain secrets and must not be committed.

### Running Locally

From the repository root, start the complete development workspace:

```bash
pnpm dev
```

The web application defaults to <http://localhost:3000>, and the API defaults to <http://localhost:3001>. You can override the port with `PORT` in the `.env` files.

### Useful Commands

| Command | Description |
|---------|------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all apps and packages |
| `pnpm dev` | Start all development servers |
| `pnpm test` | Run tests across the monorepo |

## Contributing

Contributions are always welcome!

To get started, follow our organization [onboarding](https://www.hackforla.org/getting-started) steps, and as always, please adhere to [Hack for LA's Code of Conduct](https://github.com/hackforla/codeofconduct).
