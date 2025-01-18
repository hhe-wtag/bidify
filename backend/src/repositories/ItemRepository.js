import BaseRepository from './BaseRepository.js';
import NotificationRepository from './NotificationRepository.js';
import { Bid } from '../models/bid.model.js';
import { Item } from '../models/item.model.js';
import { User } from '../models/user.model.js';
import NotificationSocketHandler from '../socket_handlers/NotificationSocketHandler.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class ItemRepository extends BaseRepository {
  constructor() {
    super(Item);
    this.notificationRepository = new NotificationRepository();
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
    if (updates.status === 'sold') {
      const winningBid = await Bid.findOne({
        _id: item.lastBidId,
      });
      if (winningBid) {
        const winnerNotify =
          await this.notificationRepository.createNotification(
            winningBid.bidderId,
            item._id,
            'AUCTION_WON',
            `Congratulations! You won the auction for "${item.title}".`,
            'Auction Won'
          );
      }

      const otherBidders = await Bid.find({
        itemId: item._id,
      })
        .distinct('bidderId')
        .where('_id');

      const filteredBidders = otherBidders.filter(
        (userId) => userId.toString() !== winningBid.bidderId.toString()
      );
      const auctionEndNotify = await Promise.all(
        filteredBidders.map(async (userId) => {
          try {
            const outbidNotification =
              await this.notificationRepository.createNotification(
                userId,
                item._id,
                'AUCTION_END',
                `The auction for "${item.title}" has ended.`,
                'Auction Ended'
              );
            return outbidNotification;
          } catch (error) {
            console.error(
              `Failed to create notification for userId ${userId}:`,
              error
            );
            return null;
          }
        })
      );
      const winner = await User.findOne(
        { _id: winningBid.bidderId },
        'firstName lastName'
      );
      const WinnerName = `${winner.firstName} ${winner.lastName}`;
      const sellerNotification =
        await this.notificationRepository.createNotification(
          item.sellerId,
          item._id,
          'AUCTION_END',
          `The auction for "${item.title}" has ended. The winner is ${WinnerName}.`,
          'Auction Ended'
        );
      auctionEndNotify.push(sellerNotification);
    }
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
