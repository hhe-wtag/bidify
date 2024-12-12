import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

class BaseController {
  constructor(service) {
    if (!service) {
      throw new ApiError(500, 'Service instance is required for BaseController');
    }
    this.service = service;
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll();
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.getById(id);

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

    const result = await this.service.create(data);

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

    const result = await this.service.update(id, data);

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
    const result = await this.service.delete(id);

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
