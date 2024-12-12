import BaseController from './BaseController.js';
import UserService from '../services/UserService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  findByEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
      throw new ApiError(400, 'Email query parameter is required');
    }

    const user = await this.service.findByEmail(email);

    if (!user) {
      throw new ApiError(404, `User with email ${email} not found`);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  });
}

export default new UserController();
