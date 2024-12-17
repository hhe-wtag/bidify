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

  findByEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Email query parameter is required'
      );
    }

    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `User with email ${email} not found`
      );
    }

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, user, 'User found Successfully'));
  });
}

export default new UserController();
