import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'REGISTRATION',
        'AUCTION_END',
        'AUCTION_CANCELED',
        'BID_PLACED',
        'AUCTION_WON',
        'OUTBID',
      ],
    },
    message: {
      type: String,
      required: true,
    },
    preview: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
