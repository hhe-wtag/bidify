import mongoose from 'mongoose';
import slugify from 'slugify';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    slug: {
      type: String,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
    },
    startingBid: {
      type: Number,
      required: [true, 'Starting bid is required'],
      min: [0, 'Starting bid must be a positive number'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'sold', 'canceled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    endTime: {
      type: Date,
      required: [true, 'Auction end time is required'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'End time must be a future date',
      },
    },
    minimumBidIncrement: {
      type: Number,
      required: [true, 'Minimum bid increment is required'],
      min: [10.0, 'Minimum bid increment must be at least 10'],
    },
    latestBid: {
      type: Number,
      default: null,
    },
    lastBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

itemSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  try {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
    next();
  } catch (error) {
    next(error);
  }
});

itemSchema.virtual('isOngoing').get(function () {
  return this.status === 'active' && this.endTime > new Date();
});

export const Item = mongoose.model('Item', itemSchema);
