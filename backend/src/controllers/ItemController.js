import BaseController from './BaseController.js';
import ItemRepository from '../repositories/ItemRepository.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class ItemController extends BaseController {
  constructor() {
    super(new ItemRepository());
  }

  getBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const item = await this.repository.findOne({ slug });

    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Item not found!');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, item, 'Item found!'));
  });

  create = asyncHandler(async (req, res) => {
    const newItemData = { ...req.body, sellerId: req.user._id };

    const baseURL = `${req.protocol}://${req.get('host')}`;

    const imageUploadResult = await this.repository.uploadFiles(
      req.files,
      baseURL
    );

    if (newItemData.endTime && new Date(newItemData.endTime) <= new Date()) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'End time must be a future date'
      );
    }

    if (imageUploadResult.length === req.files.length) {
      const createdItem = await this.repository.create({
        ...newItemData,
        images: [...imageUploadResult],
      });

      res
        .status(HTTP_STATUS.CREATED)
        .json(
          new ApiResponse(
            HTTP_STATUS.CREATED,
            createdItem,
            'Item created successfully!'
          )
        );
    } else
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `"Couldn't upload images, failed to create listing!"`
      );
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    if (updates.endTime && new Date(updates.endTime) <= new Date()) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'End time must be a future date'
      );
    }

    const updatedItem = await this.repository.updateItem(id, userId, updates);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, updatedItem, 'Item updated!'));
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await this.repository.deleteItem(id, userId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, null, 'Item deleted!'));
  });
}

export default new ItemController();
