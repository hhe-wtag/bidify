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

  getCurrentUser = asyncHandler(async (req, res) => {
    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          { user: req.user },
          'User details retrieved successfully'
        )
      );
  });

  updateUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const updateData = req.body;

    const validFields = [
      'firstName',
      'lastName',
      'address',
      'balance',
      'contactNumber',
    ];

    if (!Object.keys(updateData).some((field) => validFields.includes(field))) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No valid fields to update');
    }

    const updatedUser = await this.repository.updateUserById(
      userId,
      updateData
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User updated successfully!',
      data: updatedUser,
    });
  });
}

export default new UserController();
