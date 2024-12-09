import { User } from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';

const createUser = async (user) => {
  const createdUser = await User.create(user);

  if (!createUser) {
    throw new ApiError(500, 'Failed to create user!');
  }
  return createdUser;
};

export default {
  createUser,
};
