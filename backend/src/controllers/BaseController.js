import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class BaseController {
  constructor(repository) {
    if (!repository) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Respository instance is required for BaseController'
      );
    }
    this.repository = repository;
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.repository.findAll();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.repository.findById(id);

    if (!result) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `Resource with ID ${id} not found`
      );
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  });

  create = asyncHandler(async (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Request body is missing');
    }

    const result = await this.repository.create(data);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Resource created successfully!',
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Request body is missing');
    }
    const result = await this.repository.updateById(id, data, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `Resource with ID ${id} not found`
      );
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Resource updated successfully!',
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.repository.delete(id);

    if (!result) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `Resource with ID ${id} not found`
      );
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Resource deleted successfully!',
      data: result,
    });
  });
}

export default BaseController;
