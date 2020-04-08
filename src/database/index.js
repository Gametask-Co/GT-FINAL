import mongoose from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies

class Database {
  constructor() {
    this.init();
  }

  async init() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
