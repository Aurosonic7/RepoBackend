export default {
  MYSQL: {
    HOST: process.env.MYSQL_HOST,
    USER: process.env.MYSQL_USER,
    PASSWORD: process.env.MYSQL_PASSWORD,
    DATABASE: process.env.MYSQL_DATABASE,
    PORT: Number(process.env.MYSQL_PORT),
  },
  MONGO: {
    URI: process.env.MONGO_URI,
  },
};
