import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

class BaseController {
  constructor(repository) {
    if (!repository) {
      throw new ApiError(500, 'Respository instance is required for BaseController');
    }
    this.repository = repository;
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.repository.findAll();
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.repository.findById(id);

    if (!result) {
      throw new ApiError(404, `Resource with ID ${id} not found`);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  create = asyncHandler(async (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(400, 'Request body is missing');
    }

    const result = await this.repository.create(data);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully!',
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(400, 'Request body is missing');
    }

    const result = await this.repository.update(id, data);

    if (!result) {
      throw new ApiError(404, `Resource with ID ${id} not found`);
    }

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully!',
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.repository.delete(id);

    if (!result) {
      throw new ApiError(404, `Resource with ID ${id} not found`);
    }

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully!',
      data: result,
    });
  });
}

export default BaseController;
