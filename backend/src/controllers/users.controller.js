import usersService from '../services/users.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createUser = asyncHandler(async (req, res) => {
  const user = req.body;
  const result = await usersService.createUser(user);

  return res.status(201).json(new ApiResponse(200, result, 'User created successfully!'));
});

export default { createUser };
