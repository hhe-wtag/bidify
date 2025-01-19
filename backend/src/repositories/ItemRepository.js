import mongoose from 'mongoose';

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

  async uploadFiles(files, baseURL) {
    const filesInfo = files.map((file) => ({
      filename: file.filename,
      filepath: `${baseURL}/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));
    return filesInfo;
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

    if (updatedItem.status === 'sold') {
      const winningBid = await Bid.findOne({
        _id: item.lastBidId,
      });
      if (winningBid) {
        const winnerNotify =
          await this.notificationRepository.createNotification(
            winningBid.bidderId,
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
          'AUCTION_END',
          `The auction for "${item.title}" has ended. The winner is ${WinnerName}.`,
          'Auction Ended'
        );
      auctionEndNotify.push(sellerNotification);
    }

    return updatedItem;
  }

  async deleteItem(id, userId) {
    await this.checkIfTheOperationIsAllowed(id, userId);

    return this.deleteById(id);
  }

  async getUserEnlistedItems(userId) {
    const items = await Item.find({ sellerId: userId });
    return items;
  }

  getUserWinningItems = async (userId) => {
    try {
      const winningItems = await Item.aggregate([
        {
          $match: {
            status: 'sold',
            lastBidId: { $ne: null },
          },
        },
        {
          $lookup: {
            from: 'bids',
            localField: 'lastBidId',
            foreignField: '_id',
            as: 'lastBid',
          },
        },
        // Unwind the lastBid array
        {
          $unwind: '$lastBid',
        },
        // Only keep items where the last bidder is our user
        {
          $match: {
            'lastBid.bidderId': new mongoose.Types.ObjectId(userId),
          },
        },
        // Join with categories
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        // Join with users (sellers)
        {
          $lookup: {
            from: 'users',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller',
          },
        },
        // Unwind arrays (if they exist)
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$seller',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Reshape the output
        {
          $project: {
            _id: 1,
            id: '$_id',
            title: 1,
            description: 1,
            status: 1,
            endTime: 1,
            startingBid: 1,
            minimumBidIncrement: 1,
            latestBid: '$lastBid.latestBidAmount',
            lastBidId: 1,
            sellerId: 1,
            slug: 1,
            images: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
      ]);

      return winningItems.map((item) => ({
        ...item,
        timeLeft: item.endTime > new Date() ? item.endTime - new Date() : 0,
        isOngoing: item.endTime > new Date(),
      }));
    } catch (error) {
      throw new Error(`Error fetching winning items: ${error.message}`);
    }
  };
}

export default ItemRepository;
