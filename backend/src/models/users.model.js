import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // required fields
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^(?:\+?88)?01[3-9]\d{8}$/, 'Please provide a valid Bangladeshi mobile number'],
      validate: {
        validator: function (v) {
          // Validate exact 11 digits for Bangladeshi mobile numbers
          return /^(?:\+?88)?01[3-9]\d{8}$/.test(v);
        },
        message: 'Contact number must be a valid 11-digit Bangladeshi mobile number',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Prevents password from being returned in query results
    },

    // optional fields
    address: {
      street: {
        type: String,
        trim: true,
        default: null,
      },
      city: {
        type: String,
        trim: true,
        default: null,
      },
      state: {
        type: String,
        trim: true,
        default: null,
      },
      zipCode: {
        type: String,
        trim: true,
        match: [/^\d{4}$/, 'Please provide a valid ZIP code'],
        default: null,
      },
      country: {
        type: String,
        trim: true,
        default: null,
      },
    },
    balance: {
      type: Number,
      min: [0, 'Balance cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'registrationDate' },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
