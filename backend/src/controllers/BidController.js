import BaseController from './BaseController.js';
import BidRepository from '../repositories/BidRepository.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class BidController extends BaseController {
  constructor() {
    super(new BidRepository());
  }

  getLatest10Bids = asyncHandler(async (req, res) => {
    const { itemId } = req.body;

    if (!itemId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'ItemId is required');
    }

    const result = await this.repository.getLatest10Bids(itemId);

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          result,
          'Latest 10 Bids fetched successfully'
        )
      );
  });

  placeBid = asyncHandler(async (req, res) => {
    const bidData = req.body;

    const requiredFields = {
      itemId: 'Item ID is required',
      bidderId: 'Bidder ID is required',
      incrementBidAmount: 'Increment Bid Amount is required',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!bidData[field]) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
      }
    });

    const result = await this.repository.placeBid(bidData);

    res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(HTTP_STATUS.CREATED, result, 'Bid placed successfully')
      );
  });
}

export default new BidController();
