import { BuildModel } from '@amazeelabs/publisher-shared';
import { DataTypes, Model, Sequelize } from 'sequelize';

import { getConfig } from './config';

type BuildCreateModel = Omit<BuildModel, 'id'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const _initDatabase = async () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: getConfig().databaseUrl,
    logging: false,
  });

  const Build = sequelize.define<Model<BuildModel, BuildCreateModel>>('Build', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    startedAt: {
      type: DataTypes.BIGINT,
    },
    finishedAt: {
      type: DataTypes.BIGINT,
    },
    success: {
      type: DataTypes.BOOLEAN,
    },
    type: {
      type: DataTypes.STRING,
    },
    logs: {
      type: DataTypes.TEXT,
    },
  });

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  return { Build };
};

type Models = Awaited<ReturnType<typeof _initDatabase>>;

let database: Models | null = null;

export const getDatabase = async (): Promise<Models> => {
  if (!database) {
    await initDatabase();
  }
  return database as Models;
};

export const initDatabase = async (): Promise<void> => {
  if (database) {
    throw new Error('Database already initialized.');
  }
  database = await _initDatabase();
};

export const saveBuildInfo = async (
  record: BuildCreateModel,
): Promise<void> => {
  const { Build } = await getDatabase();
  await Build.build(record).save();
};
