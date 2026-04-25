# Updating gem-swarm

gem-swarm uses a **link** install — it points to your local git clone of the repository.

`gemini extensions update` does **NOT** pull new code automatically for link installs. This is a Gemini CLI platform behavior, not a gem-swarm limitation.

## How to Update

```bash
cd /path/to/gem-swarm          # wherever you cloned the repo
git pull origin main
npm install                     # in case dependencies changed
npm run build                   # regenerate agent stubs + registries
```

## Verify the Update

```bash
gemini extensions list          # should show gem-swarm with the correct path
```

Then start a new `gemini` session — the updated extension will be loaded automatically.

## Reinstalling from Scratch

If something is broken beyond repair:

```bash
gemini extensions uninstall gem-swarm
cd /path/to/gem-swarm
git pull origin main
npm install
npm run build
gemini extensions install .
```

## Checking Your Install Type

```bash
cat ~/.gemini/extensions/gem-swarm/.gemini-extension-install.json
```

- `"type": "link"` → local clone, update with `git pull`
- `"type": "github"` → installed from URL, `gemini extensions update gem-swarm` works
