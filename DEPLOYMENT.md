# Deployment

## Worker

Create a KV namespace and copy its id into `worker/wrangler.toml` (or the equivalent root `wrangler.toml`), then set `MUSEAI_AGENT_KEY`:

```sh
cd worker
npx wrangler deploy
```

The repository also includes a root `wrangler.toml` for hosting systems that invoke
`wrangler deploy` from the checkout root. It points directly to `worker/worker.js`
and deliberately does not configure a static assets directory, so `node_modules/`
and the rest of the repository are never uploaded as Worker assets.

## Desktop

Use GitHub Actions on a tag or build locally with `npm run build:win`, `npm run build:mac`, or `npm run build:linux`.

## Android

Install Android Studio and a supported SDK, run `npx cap add android`, then `npm run mobile:sync`. Build the signed release in Android Studio or in the Android workflow after adding signing secrets.
