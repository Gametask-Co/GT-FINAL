import mongoose from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';

class Database {
  constructor() {
    this.init();
  }

  async init() {
    if (process.env.NODE_ENV === 'test') {
      const mongod = new MongoMemoryServer();

      const uri = await mongod.getUri();

      this.mongoConnection = mongoose.connect(uri, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      });
    } else {
      this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      });
    }
  }
}

export default new Database();
