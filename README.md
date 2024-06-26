# Silverback

## What is this?

This is the Amazee Labs _Silverback_ monorepo. A central hub for open source
packages and tools.

## Directory structure

- `packages/npm`: npm packages
- `packages/composer`: composer php packages
- `apps`: applications that use the two above

## Setup locally

### Requirements

- Git
- Node.js + pnpm
- PHP + Composer

### Setup

```sh
git clone https://github.com/AmazeeLabs/silverback-mono.git
cd silverback-mono
pnpm i
pnpm build
```
