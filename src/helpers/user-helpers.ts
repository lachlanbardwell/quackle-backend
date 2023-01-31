import { Quack } from '../models/quacks-model';
import { User } from '../models/user-model';
import { Image } from '../models/image-model';

export const newUser = async (props: {
  name: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: Date;
}) => {
  const user = User.build({
    ...props,
    avatar: '',
    createdAt: new Date(),
    tagline: '',
    banner: '',
    location: '',
    biography: '',
    quacks: 0,
    likedQuacks: [],
    following: [],
    followers: [],
    usersBlocked: [],
  });
  await user.save();
  return user;
};

export const getUsers = async (limit: number) =>
  await User.find().select('-password -email -usersBlocked').limit(limit);

export const findOneUser = async (username: string) =>
  await User.findOne({ username }).populate('avatar').populate('banner');

export const deleteUsersQuacks = async (id: string) =>
  await Quack.deleteMany({ user: id });
