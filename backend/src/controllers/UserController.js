import BaseController from './BaseController.js';
import UserService from '../services/UserService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  create = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, contactNumber, password } = req.body;

    if (!firstName || !lastName || !email || !contactNumber || !password) {
      throw new ApiError(400, 'All required fields must be provided!');
    }

    const user = { firstName, lastName, email, contactNumber, password };

    const result = await this.service.create(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      data: result,
    });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and Password are required!');
    }

    const user = await this.service.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: user,
    });
  });
}

export default new UserController();
