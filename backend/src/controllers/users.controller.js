import usersService from '../services/users.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, contactNumber, password } = req.body;
  if (!firstName || !lastName || !email || !contactNumber || !password) {
    return res.status(400).json(new ApiResponse(400, null, 'All required fields must be provided!'));
  }
  const user = {
    firstName,
    lastName,
    email,
    contactNumber,
    password,
  };
  const result = await usersService.createUser(user);

  return res.status(201).json(new ApiResponse(200, result, 'User created successfully!'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiResponse(400, null, 'Email and Password are required!'));
  }

  const user = await usersService.loginUser(email, password);

  return res.status(200).json(new ApiResponse(200, user, 'Login successful!'));
});

export default { createUser, loginUser };
