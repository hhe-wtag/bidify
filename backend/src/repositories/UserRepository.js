import BaseRepository from './BaseRepository.js';
import { User } from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email }).select('+password');
  }

  async register(data) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists.');
    }
    return this.create(data);
  }

  async login(email, password) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password.'
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password.'
      );
    }
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return userWithoutPassword;
  }
}

export default UserRepository;
