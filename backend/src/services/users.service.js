import { User } from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';

const createUser = async (user) => {
  const createdUser = await User.create(user);

  if (!createUser) {
    throw new ApiError(500, 'Failed to create user!');
  }
  return createdUser;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { password: _, ...userData } = user.toObject();

  return userData;
};

export default {
  createUser,
  loginUser,
};
