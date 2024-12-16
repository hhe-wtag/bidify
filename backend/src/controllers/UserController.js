import BaseController from './BaseController.js';
import UserService from '../services/UserService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, contactNumber, password } = req.body;

    if (!firstName || !lastName || !email || !contactNumber || !password) {
      throw new ApiError(400, 'All required fields must be provided!');
    }

    const userData = { firstName, lastName, email, contactNumber, password };

    const user = await this.service.register(userData);

    res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(HTTP_STATUS.CREATED, user, 'User created successfully!')
      );
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and Password are required!');
    }

    const userData = await this.service.login(email, password);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, userData, 'Login Successful!'));
  });

  getCurrentUser = asyncHandler(async (req, res) => {
    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          req.user,
          'User details retrieved successfully'
        )
      );
  });
}

export default new UserController();
