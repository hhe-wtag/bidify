import BaseController from './BaseController.js';
import UserService from '../services/UserService.js';
import ApiError from '../utils/ApiError.js';

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  register = async (req, res) => {
    const { firstName, lastName, email, contactNumber, password } = req.body;

    if (!firstName || !lastName || !email || !contactNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided!',
      });
    }

    const user = { firstName, lastName, email, contactNumber, password };

    try {
      const result = await this.service.create(user);

      res.status(201).json({
        success: true,
        message: 'User created successfully!',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while creating the user.',
      });
    }
  };

  login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and Password are required!');
    }

    try {
      const user = await this.service.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful!',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred during login.',
      });
    }
  };
}

export default new UserController();
