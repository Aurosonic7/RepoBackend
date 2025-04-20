import 'dotenv/config';
import development from './env/development.js';
import production from './env/production.js';

const envConfig =
  process.env.NODE_ENV === 'production' ? production : development;

const config = {
  app: {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'change_this_secret'
  },
  mysql: envConfig.MYSQL,
  mongo: envConfig.MONGO,
};

export default config;