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

  async create(data) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists.');
    }

    return this.model.create(data);
  }
}

export default UserRepository;
