import mongoose, { Schema } from 'mongoose';
import { IUser, IUserModel, IUserDoc } from '../types/user-schema';

const userSchema: Schema<IUserDoc> = new mongoose.Schema({
  avatar: { type: Schema.Types.ObjectId, ref: 'Image' },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date },
  createdAt: { type: Date },
  tagline: { type: String },
  banner: { type: Schema.Types.ObjectId, ref: 'Image' },
  location: { type: String },
  biography: { type: String },
  quacks: { type: Number },
  reQuacks: { type: Number },
  likedQuacks: [{ type: String }],
  following: [{ type: String }],
  followers: [{ type: String }],
  usersBlocked: [{ type: String }],
});

userSchema.statics.build = (user: IUser) => new User(user);

export const User = mongoose.model<any, IUserModel>('User', userSchema);
