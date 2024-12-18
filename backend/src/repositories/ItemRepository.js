import BaseRepository from './BaseRepository.js';
import { Item } from '../models/item.model.js';

class ItemRepository extends BaseRepository {
  constructor() {
    super(Item);
  }
}

export default ItemRepository;
