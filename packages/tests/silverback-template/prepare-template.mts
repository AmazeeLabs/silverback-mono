import { $, fs, path } from 'zx';

type Package = {
  name: string;
  version: string;
  path: string;
  private: boolean;
};

const monorepoRoot = path.resolve(
  new URL(import.meta.url).pathname.split('/').slice(0, -1).join('/'),
  '../../..',
);

console.log('👉 Clone template and install its deps.');
await $`rm -rf /tmp/silverback-template`;
await $`cd /tmp && git clone https://github.com/AmazeeLabs/silverback-template.git`;
await $`cd /tmp/silverback-template && pnpm i`;

console.log('👉 Make graphql version the same.');
const graphqlVersion = JSON.parse(
  `${await $`cd ${monorepoRoot}/packages/npm/@amazeelabs/codegen-gatsby-fragments && pnpm ls graphql --json`}`,
)[0].dependencies.graphql.version;
replaceGraphqlVersion(
  `/tmp/silverback-template/apps/decap/package.json`,
  graphqlVersion,
);
replaceGraphqlVersion(
  `/tmp/silverback-template/packages/schema/package.json`,
  graphqlVersion,
);
await $`cd /tmp/silverback-template && pnpm install --no-frozen-lockfile && pnpm dedupe`;

console.log('👉 Make all monorepo public packages available for linking.');
const monoPackages: Array<Package> = JSON.parse(
  `${await $`pnpm list -r --depth -1 --json`}`,
);
const availablePackages: Array<string> = [];
for (const pkg of monoPackages) {
  if (!pkg.private && pkg.name.startsWith('@amazeelabs/')) {
    await $`cd ${pkg.path} && pnpm link --global`;
    availablePackages.push(pkg.name);
  }
}

console.log('👉 Link npm packages to template.');
const templatePackages: Array<Package> = JSON.parse(
  `${await $`cd /tmp/silverback-template && pnpm list -r --depth -1 --json`}`,
);
for (const pkg of templatePackages) {
  const names =
    `${await $`cd ${pkg.path} && ls -1 node_modules/@amazeelabs || true`}`
      .split('\n')
      .map((it) => it.trim())
      .filter((it) => !!it);
  for (const name of names) {
    const fullName = `@amazeelabs/${name}`;
    if (availablePackages.includes(fullName)) {
      await $`cd ${pkg.path} && pnpm link --global ${fullName}`;
    }
  }
}

console.log('👉 Link composer packages to template.');
const composerJsonPath = '/tmp/silverback-template/apps/cms/composer.json';
const composerJson: {
  repositories: Array<{
    type: string;
    url: string;
  }>;
  require: Record<string, string>;
} = fs.readJSONSync(composerJsonPath);
composerJson.repositories.unshift({
  type: 'path',
  url: `${monorepoRoot}/packages/composer/*/*`,
});
for (const name of Object.keys(composerJson.require)) {
  if (name.startsWith('amazeelabs/')) {
    composerJson.require[name] = '@dev';
  }
}
fs.writeJSONSync(composerJsonPath, composerJson);
await $`cd /tmp/silverback-template/apps/cms && composer update 'amazeelabs/*'`;

function replaceGraphqlVersion(packageJsonPath: string, version: string) {
  const packageJson = fs.readJSONSync(packageJsonPath);
  packageJson.dependencies.graphql = version;
  fs.writeJSONSync(packageJsonPath, packageJson);
}
