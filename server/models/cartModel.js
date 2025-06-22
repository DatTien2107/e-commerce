import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "user id is required"],
    },
    cartItems: [
      {
        name: {
          type: String,
          required: [true, "product name is required"],
        },
        price: {
          type: Number,
          required: [true, "product price is required"],
        },
        quantity: {
          type: Number,
          required: [true, "product quantity is required"],
          default: 1,
          min: [1, "quantity must be at least 1"],
        },
        image: {
          type: String,
          required: [true, "product image is required"],
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index để tối ưu query
cartSchema.index({ user: 1 });
cartSchema.index({ "cartItems.product": 1 });

// Middleware để tự động tính toán totalItems và totalAmount
cartSchema.pre("save", function (next) {
  this.totalItems = this.cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  this.totalAmount = this.cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  next();
});

export const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
