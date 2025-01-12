import mongoose from 'mongoose';

import BaseRepository from './BaseRepository.js';
import { Bid } from '../models/bid.model.js';
import { Item } from '../models/item.model.js';
import { Notification } from '../models/notification.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class BidSocketRepository extends BaseRepository {
  constructor() {
    super(Bid);
  }

  validateBidData(bidData) {
    const { itemId, bidderId, incrementBidAmount } = bidData;

    if (!itemId || !bidderId || !incrementBidAmount) {
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Missing required fields: itemId, bidderId, or incrementBidAmount'
      );
    }

    if (typeof incrementBidAmount !== 'number' || incrementBidAmount <= 0) {
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Increment amount must be a positive number'
      );
    }
  }

  async placeBid(bidData) {
    try {
      this.validateBidData(bidData);
      const { itemId, bidderId, incrementBidAmount } = bidData;

      const item = await Item.findById(itemId);
      if (!item) {
        return new ApiResponse(HTTP_STATUS.NOT_FOUND, null, 'Item not found');
      }

      if (item.sellerId.toString() === bidderId) {
        return new ApiResponse(
          HTTP_STATUS.BAD_REQUEST,
          null,
          'Seller cannot bid on own item'
        );
      }

      if (item.minimumBidIncrement > incrementBidAmount) {
        return new ApiResponse(
          HTTP_STATUS.BAD_REQUEST,
          null,
          `Increment bid amount must be at least ${item.minimumBidIncrement}`
        );
      }

      const lastBid = await Bid.findOne({ itemId }).sort({ createdAt: -1 });
      const lastBidAmount = lastBid
        ? lastBid.latestBidAmount
        : item.startingBid;
      const latestBidAmount = lastBidAmount + incrementBidAmount;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const bid = new Bid({
          itemId,
          bidderId,
          incrementBidAmount,
          lastBidAmount,
          latestBidAmount,
        });

        const savedBid = await bid.save({ session });

        const updatedItem = await Item.findByIdAndUpdate(
          itemId,
          { lastBidId: savedBid._id, latestBid: latestBidAmount },
          { new: true, session }
        );

        if (!updatedItem) {
          throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Item not found');
        }

        const bidPlacedNotification = new Notification({
          userId: bidderId,
          type: 'BID_PLACED',
          message: `You have placed a bid of $${latestBidAmount} on ${item.title}`,
          preview: 'Bid Placed',
        });
        await bidPlacedNotification.save({ session });

        const previousBidders = await Bid.find({ itemId })
          .distinct('bidderId')
          .where('_id')
          .ne(bidderId);

        const outbidNotifications = previousBidders
          .filter((userId) => userId.toString() !== bidderId.toString())
          .map((userId) => ({
            userId,
            type: 'OUTBID',
            message: `You have been outbid on ${item.title}. Current bid is $${latestBidAmount}.`,
            preview: 'Outbid',
          }));

        if (outbidNotifications.length > 0) {
          await Notification.insertMany(outbidNotifications, { session });
        }

        await session.commitTransaction();
        return new ApiResponse(
          HTTP_STATUS.CREATED,
          savedBid,
          'Bid placed successfully'
        );
      } catch (error) {
        await session.abortTransaction();
        return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
      } finally {
        session.endSession();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return new ApiResponse(error.statusCode, null, error.message);
      }
      return new ApiResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
        'Failed to place bid'
      );
    }
  }
}

export default BidSocketRepository;
