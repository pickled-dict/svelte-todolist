# Svelte TodoList Frontend

## Local Development

Clone the repository

```shell
git clone https://github.com/pickled-dict/svelte-todolist
```

## Docker

If Docker is installed, the following will spin up a development container at `localhost:5173` in detached mode (running as a service in docker engine)

```
docker-compose up -d
```

You can also run it in attached mode by omitting the `-d` flag:

```
docker-compose up
```

## Node

This repository was developed using the latest LTS release of NPM, which is `18.17.1`. To install the dependencies run according to your package manager,

NPM:

```
npm install
```

PNPM:

```
pnpm install
```

Yarn:

```
yarn
```

Copy the `.env.dev` into `.env`

```
cp .env.dev .env
```


Finally, you can run the application 🚀

NPM:

```
npm run dev
```

PNPM:

```
pnpm run dev
```

Yarn:

```
yarn dev
```
