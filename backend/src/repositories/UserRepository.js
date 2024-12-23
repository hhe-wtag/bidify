import BaseRepository from './BaseRepository.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async register(data) {
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
    }

    const newUser = new this.model(data);
    await newUser.validate();
    await newUser.save();

    const token = await newUser.generateAuthToken();

    return { newUser, token };
  }

  async login(email, password) {
    const user = await this.findByEmailWithPassword(email);
    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'No user found with this email address'
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid password or email');
    }

    user.password = undefined;
    const token = await user.generateAuthToken();

    return { user, token };
  }

  async updateUserById(id, updateData) {
    const user = await this.updateById(id, updateData);

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findByIdWithPassword(userId);

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Current password is incorrect'
      );
    }

    user.password = newPassword;
    await user.save();

    user.password = undefined;
    return user;
  }
}

export default UserRepository;
