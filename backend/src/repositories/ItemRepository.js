import BaseRepository from './BaseRepository.js';
import { Item } from '../models/item.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class ItemRepository extends BaseRepository {
  constructor() {
    super(Item);
  }

  async checkIfTheOperationIsAllowed(itemId, userId) {
    const item = await this.findById(itemId);

    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Item not found!');
    }

    if (item.sellerId.toString() !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to perform this operation'
      );
    }

    return item;
  }

  async updateItem(id, userId, updates) {
    const item = await this.checkIfTheOperationIsAllowed(id, userId);
    Object.assign(item, updates);

    const updatedItem = await item.save();

    return updatedItem;
  }

  async deleteItem(id, userId) {
    await this.checkIfTheOperationIsAllowed(id, userId);

    return this.deleteById(id);
  }
}

export default ItemRepository;
