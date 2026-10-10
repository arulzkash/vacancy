# Next.js frontend

See the [project README](../README.md) for requirements, installation, configuration, and tests.

From this directory:

```sh
npm ci
npm run setup
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`. Run `npm run test:e2e` to execute browser tests against dedicated Laravel and Next.js test servers.
