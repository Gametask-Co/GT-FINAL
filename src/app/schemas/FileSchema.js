import { Schema } from 'mongoose';

const FileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
});

FileSchema.virtual('url').get(() => {
  return `${process.env.STATIC_URL}/avatar/${this.path}`;
});

export default FileSchema;
