import mongoose from 'mongoose';

import BaseRepository from './BaseRepository.js';
import NotificationRepository from './NotificationRepository.js';
import { Bid } from '../models/bid.model.js';
import { Item } from '../models/item.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class BidSocketRepository extends BaseRepository {
  constructor() {
    super(Bid);
    this.notificationRepository = new NotificationRepository();
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

        const bidPlacedNotification =
          await this.notificationRepository.createNotification(
            bidderId,
            itemId,
            'BID_PLACED',
            `You have placed a bid of $${latestBidAmount} on ${item.title}`,
            'Bid Placed'
          );

        const previousBidders = await Bid.find({ itemId })
          .distinct('bidderId')
          .where('_id')
          .ne(bidderId);

        const outbidNotifications = await Promise.all(
          previousBidders
            .filter((userId) => userId.toString() !== bidderId.toString())
            .map(async (userId) => {
              const outbidNotification =
                await this.notificationRepository.createNotification(
                  userId,
                  itemId,
                  'OUTBID',
                  `You have been outbid on ${item.title}. Current bid is $${latestBidAmount}.`,
                  'Outbid'
                );
              return outbidNotification;
            })
        );

        await session.commitTransaction();

        return new ApiResponse(
          HTTP_STATUS.CREATED,
          {
            savedBid,
            bidPlacedNotification,
            outbidNotifications,
          },
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

  async itemAuctionTimeEndStatusUpdate() {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const endedAuctionItems = await Item.find({
        status: 'active',
        endTime: { $lte: new Date() },
      }).session(session);

      const updatePromises = endedAuctionItems.map(async (item) => {
        // Get the winning bid
        const winningBid = await Bid.findOne({
          _id: item.lastBidId,
        }).session(session);

        const updatedAuctionItem = await Item.findByIdAndUpdate(
          item._id,
          {
            status: winningBid ? 'sold' : 'canceled',
            latestBid: winningBid?.latestBidAmount || item.startingBid,
            lastBidId: winningBid?._id || null,
          },
          { new: true, session }
        );
        return updatedAuctionItem;
      });

      const processedItems = await Promise.all(updatePromises);

      await session.commitTransaction();

      return new ApiResponse(
        HTTP_STATUS.OK,
        { processedItems },
        'Items processed successfully for the auction end time'
      );
    } catch (error) {
      await session.abortTransaction();
      return new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `Failed to process ended items: ${error.message}`
      );
    } finally {
      session.endSession();
    }
  }
}

export default BidSocketRepository;
