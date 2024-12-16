import BaseController from './BaseController.js';
import UserRepository from '../repositories/UserRepository.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserController extends BaseController {
  constructor() {
    super(new UserRepository());
  }

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Email and Password are required'
        );
      }

      const user = await this.repository.findByEmail(email);

      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Incorrect password');
      }

      res
        .status(HTTP_STATUS.OK)
        .json(new ApiResponse(HTTP_STATUS.OK, user, 'Login successful!'));
    } catch (error) {
      next(error);
    }
  };

  register = async (req, res, next) => {
    try {
      const { firstName, lastName, email, contactNumber, password } = req.body;

      if (!firstName || !lastName || !email || !contactNumber || !password) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'All fields are required');
      }

      const existingUser = await this.repository.findByEmail(email);
      if (existingUser) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
      }

      const newUser = {
        firstName,
        lastName,
        email,
        contactNumber,
        password,
      };

      const createdUser = await this.repository.create(newUser);

      res
        .status(HTTP_STATUS.CREATED)
        .json(
          new ApiResponse(
            HTTP_STATUS.CREATED,
            createdUser,
            'User registered successfully!'
          )
        );
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
