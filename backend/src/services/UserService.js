import UserRepository from '../repositories/UserRepository.js';
import ApiError from '../utils/ApiError.js';

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAll() {
    return this.userRepository.findAll();
  }

  async getById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async register(data) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already exists.');
    }

    await this.userRepository.create(data);
    return;
  }

  async update(id, updateData) {
    const user = await this.userRepository.updateById(id, updateData);
    if (!user) {
      throw new ApiError(404, 'User not found or failed to update');
    }
    return user;
  }

  async delete(id) {
    const deleted = await this.userRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(404, 'User not found or failed to delete');
    }
    return deleted;
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'No user found with this email address');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Incorrect password');
    }

    const token = await user.generateAuthToken();

    return { token, user };
  }
}

export default UserService;
