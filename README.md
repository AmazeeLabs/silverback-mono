# Silverback

## What is this?

This is the the Amazee Labs _Silverback_ monorepo. A central hub for opens source packages and tools.

## Directory structure

- `packages/npm`: npm and yarn packages
- `packages/composer`: composer php packages and drupal modules
- `apps`: applications that use the two above

## Setup locally

### Requirements

- Git
- Yarn
- Composer
- [direnv](https://direnv.net/docs/installation.html) (don't forget about the [hook installation](https://direnv.net/docs/hook.html)!)

### Setup

```sh
git clone https://github.com/AmazeeLabs/silverback-mono.git
cd silverback-mono
yarn
```
