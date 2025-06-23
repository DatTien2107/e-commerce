import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { stripe } from "../server.js";

// CREATE ORDERS
export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;
    //valdiation
    // create order
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      // find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }
    res.status(201).send({
      success: true,
      message: "Order Placed Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Create Order API",
      error,
    });
  }
};

// GET ALL ORDERS - MY ORDERS
export const getMyOrdersCotroller = async (req, res) => {
  try {
    // find orders
    const orders = await orderModel.find({ user: req.user._id });
    //valdiation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "no orders found",
      });
    }
    res.status(200).send({
      success: true,
      message: "your orders data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In My orders Order API",
      error,
    });
  }
};

// GET SINGLE ORDER INFO
export const singleOrderDetrailsController = async (req, res) => {
  try {
    // find orders
    const order = await orderModel.findById(req.params.id);
    //valdiation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "no order found",
      });
    }
    res.status(200).send({
      success: true,
      message: "your order fetched",
      order,
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get UPDATE Products API",
      error,
    });
  }
};

// ACCEPT PAYMENTS
export const paymetsController = async (req, res) => {
  try {
    // get ampunt
    const { totalAmount } = req.body;
    // validation
    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "Total Amount is require",
      });
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount * 100),
      currency: "usd",
    });
    res.status(200).send({
      success: true,
      client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get UPDATE Products API",
      error,
    });
  }
};

// ========== ADMIN SECTION =============

// GET ALL ORDERS
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "All Orders Data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get UPDATE Products API",
      error,
    });
  }
};

// ========== IMPROVED CHANGE ORDER STATUS CONTROLLER ==========

// CHANGE ORDER STATUS - Version cải thiện
export const changeOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body; // Nhận status từ request body

    console.log(
      `🔄 Admin ${req.user._id} changing order ${id} status to: ${orderStatus}`
    );

    // Find order
    const order = await orderModel.findById(id);

    // Validation: Order exists
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Nếu có orderStatus trong body, thì update theo yêu cầu
    if (orderStatus) {
      // Validate status value
      const validStatuses = ["processing", "shipped", "deliverd"];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).send({
          success: false,
          message: `Invalid order status. Valid statuses are: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      // Check if status is already the same
      if (order.orderStatus === orderStatus) {
        return res.status(400).send({
          success: false,
          message: `Order is already ${orderStatus}`,
        });
      }

      // Store old status for response
      const oldStatus = order.orderStatus;

      // Update order status
      order.orderStatus = orderStatus;

      // Set delivery date if status is delivered
      if (orderStatus === "deliverd") {
        order.deliverdAt = new Date();
      }

      await order.save();

      console.log(
        `✅ Order ${id} status changed from ${oldStatus} to ${orderStatus}`
      );

      return res.status(200).send({
        success: true,
        message: `Order status updated from ${oldStatus} to ${orderStatus}`,
        data: {
          orderId: order._id,
          oldStatus,
          newStatus: orderStatus,
          deliveredAt: order.deliverdAt,
          updatedAt: order.updatedAt,
        },
      });
    }

    // Nếu KHÔNG có orderStatus trong body, thì auto-advance (backward compatibility)
    else {
      const oldStatus = order.orderStatus;
      let newStatus;

      if (order.orderStatus === "processing") {
        newStatus = "shipped";
        order.orderStatus = "shipped";
      } else if (order.orderStatus === "shipped") {
        newStatus = "deliverd";
        order.orderStatus = "deliverd";
        order.deliverdAt = new Date();
      } else {
        return res.status(400).send({
          success: false,
          message: "Order already delivered - cannot advance further",
        });
      }

      await order.save();

      console.log(
        `✅ Order ${id} auto-advanced from ${oldStatus} to ${newStatus}`
      );

      return res.status(200).send({
        success: true,
        message: `Order status updated from ${oldStatus} to ${newStatus}`,
        data: {
          orderId: order._id,
          oldStatus,
          newStatus,
          deliveredAt: order.deliverdAt,
          updatedAt: order.updatedAt,
        },
      });
    }
  } catch (error) {
    console.error("❌ Change order status error:", error);

    // Handle cast error (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid order ID format",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).send({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    // Generic server error
    res.status(500).send({
      success: false,
      message: "Internal server error while updating order status",
      error: error.message,
    });
  }
};
