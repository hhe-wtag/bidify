import mongoose from 'mongoose';

import BaseRepository from './BaseRepository.js';
import { Bid } from '../models/bid.model.js';
import { Item } from '../models/item.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class BidRepository extends BaseRepository {
  constructor() {
    super(Bid);
  }

  async placeBid(bidData) {
    const { itemId, bidderId, incrementBidAmount } = bidData;

    const item = await Item.findById(itemId);

    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Item not found');
    }

    if (item.sellerId.toString() === bidderId) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Seller cannot bid on own item'
      );
    }

    if (item.minimumBidIncrement > incrementBidAmount) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Increment bid amount must be at least ${item.minimumBidIncrement}`
      );
    }

    const lastBid = await Bid.findOne({ itemId }).sort({ createdAt: -1 });

    const lastBidAmount = lastBid ? lastBid.latestBidAmount : item.startingBid;
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

      await session.commitTransaction();
      return savedBid;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default BidRepository;
