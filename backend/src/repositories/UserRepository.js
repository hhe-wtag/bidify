import BaseRepository from './BaseRepository.js';
import NotificationRepository from './NotificationRepository.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async register(data) {
    const existingUser = await this.model.findOne({ email: data.email });

    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
    }

    const user = new this.model(data);
    await user.validate();
    await user.save();

    const token = await user.generateAuthToken();

    user.password = undefined;

    const notificationRepo = new NotificationRepository();
    await notificationRepo.createNotification(
      user._id,
      'REGISTRATION',
      'Welcome to Bidify! Your account has been successfully created.',
      'New Account'
    );
    return { user, token };
  }

  async login(email, password) {
    const user = await this.model.findOne({ email }).select('+password');
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

    const notificationRepo = new NotificationRepository();
    const unreadNotifications = await notificationRepo.getNotificationsForUser(
      user._id
    );

    return { user, token, unreadNotifications };
  }

  async updateUserById(id, updateData) {
    const user = await this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.model.findById(userId).select('+password');

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
