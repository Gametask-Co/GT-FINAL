import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

export default mongoose.model('File', FileSchema);

//  return `${process.env.APP_URL}/files/${this.path}`;
