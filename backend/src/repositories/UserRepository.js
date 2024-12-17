import BaseRepository from './BaseRepository.js';
import { User } from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async register(data) {
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
    }

    const newUser = new this.model(data);
    await newUser.validate();

    const user = await this.model.create(data);
    user.password = undefined;

    const token = user.generateAuthToken();

    return { user, token };
  }

  async login(email, password) {
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

    return { user, token };
  }
}

export default UserRepository;
