import BaseRepository from './BaseRepository.js';
import { User } from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async create(data) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already exists.');
    }

    return this.model.create(data);
  }
}

export default UserRepository;
