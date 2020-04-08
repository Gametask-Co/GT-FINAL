import { Schema } from 'mongoose';

const UserSchema = new Schema({
  avatar: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  birthday: {
    type: Date,
    require: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deactivated: {
    type: Boolean,
    default: false,
  },
  friend_list: [
    {
      friend_id: String,
    },
  ],
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
  ],
});

export default UserSchema;
