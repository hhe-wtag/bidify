import BaseRepository from './BaseRepository.js';
import { User } from '../models/users.model.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }
}

export default UserRepository;
