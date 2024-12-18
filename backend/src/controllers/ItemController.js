import BaseController from './BaseController.js';
import ItemRepository from '../repositories/ItemRepository.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class ItemController extends BaseController {
  constructor() {
    super(new ItemRepository());
  }

  create = asyncHandler(async (req, res) => {
    const newItemData = { ...req.body, sellerId: req.user._id };

    const createdItem = await this.repository.create(newItemData);

    res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          createdItem,
          'Item created successfully!'
        )
      );
  });
}

export default new ItemController();
