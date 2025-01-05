import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    incrementBidAmount: {
      type: Number,
      required: true,
      min: [0, 'Bid amount must be positive'],
    },
    lastBidAmount: {
      type: Number,
      required: true,
      min: [0, 'Last bid amount must be positive'],
    },
    latestBidAmount: {
      type: Number,
      required: true,
      min: [0, 'Total bid amount must be positive'],
    },
  },
  {
    timestamps: true,
  }
);

export const Bid = mongoose.model('Bid', bidSchema);
