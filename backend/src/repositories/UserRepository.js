import BaseRepository from './BaseRepository.js';
import { User } from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    try {
      return await this.model.findOne({ email });
    } catch (error) {
      console.error(error);
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Error finding user by email'
      );
    }
  }

  async register(data) {
    try {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
      }

      const newUser = new this.model(data);
      await newUser.validate();

      return await this.model.create(data);
    } catch (error) {
      console.error(error);
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Registration failed'
      );
    }
  }

  async login(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'No user found with this email address'
        );
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Incorrect password');
      }

      const token = await user.generateAuthToken();

      return { token, user };
    } catch (error) {
      console.error(error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Login failed');
    }
  }

  async create(data) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists.');
    }

    return this.model.create(data);
  }
}

export default UserRepository;
