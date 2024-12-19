import BaseController from './BaseController.js';
import UserRepository from '../repositories/UserRepository.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserController extends BaseController {
  constructor() {
    super(new UserRepository());
  }

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email is required');
    }
    if (!password) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Password is required');
    }

    const data = await this.repository.login(email, password);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, data, 'Login Successful!'));
  });

  register = asyncHandler(async (req, res) => {
    const newUserData = req.body;

    const requiredFields = [
      { field: 'firstName', message: 'First Name is required' },
      { field: 'lastName', message: 'Last Name is required' },
      { field: 'email', message: 'Email is required' },
      { field: 'contactNumber', message: 'Contact Number is required' },
      { field: 'password', message: 'Password is required' },
    ];

    for (const { field, message } of requiredFields) {
      if (!newUserData[field]) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
      }
    }

    const createdUser = await this.repository.register(newUserData);

    res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          createdUser,
          'User registered successfully!'
        )
      );
  });
}

export default new UserController();
