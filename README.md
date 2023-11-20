# Silverback

## What is this?

This is the the Amazee Labs _Silverback_ monorepo. A central hub for opens
source packages and tools.

## Directory structure

- `packages/npm`: npm packages
- `packages/composer`: composer php packages
- `apps`: applications that use the two above

## Setup locally

### Requirements

- Git
- pnpm
- Composer
- [direnv](https://direnv.net/docs/installation.html) (don't forget about the
  [hook installation](https://direnv.net/docs/hook.html)!)

### Setup

```sh
git clone https://github.com/AmazeeLabs/silverback-mono.git
cd silverback-mono
pnpm i
pnpm build
```
