const fs = require("fs");
const path = require("path");
const {
  getIntrospectionQuery,
  graphql,
  buildClientSchema,
  printSchema,
} = require("gatsby/graphql");

const defaultLocation = path.resolve(process.cwd(), "generated/schema.graphql");

module.exports.onPostBootstrap = ({ store, reporter }, options) => {
  const dest = options.dest || defaultLocation;
  new Promise((resolve, reject) => {
    const { schema } = store.getState();
    graphql(schema, getIntrospectionQuery())
      .then((res) => {
        fs.writeFileSync(dest, printSchema(buildClientSchema(res.data)));
        return undefined;
      })
      .then(() => {
        reporter.info(
          `[gatsby-plugin-schema-export] Exported schema to ${dest}`
        );
        return resolve();
      })
      .catch((e) => {
        reporter.info(
          `[gatsby-plugin-schema-export] Failed to export schema: ${e}`,
          e
        );
        reject();
      });
  });
};
