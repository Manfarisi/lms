import User from "../models/user.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

// get user data
export const getUserData = async (req,res)=>{
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)

        if(!user){
            return res.json({success:false, message: 'User Not Found'})
        }

        res.json({success: true, user})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// users enrolled courses with lecture links
export const userEnrolledCourses = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({success: true, userEnrolledCourses: userData.enrolledCourses})

    } catch (error) {
        res.json({success: false, message: error.message})

    }
}

// purchase course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;
    
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.status(404).json({ success: false, message: "Data not Found" });
    }

    // Hitung harga setelah diskon
    const discountedPrice = (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2);

    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount: discountedPrice,
    });

    // Inisialisasi Stripe
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = (process.env.CURRENCY || "usd").toLowerCase();
    
    // Perbaiki origin jika undefined
    const originUrl = origin || process.env.FRONTEND_URL || "http://localhost:3000";

    // Buat line item
    const line_items = [{
      price_data: {
        currency,
        product_data: { name: courseData.courseTitle },
        unit_amount: Math.round(newPurchase.amount * 100), // Fix: Gunakan Math.round
      },
      quantity: 1,
    }];

    // Buat sesi checkout Stripe
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${originUrl}/loading/my-enrollments`,
      cancel_url: `${originUrl}/`,
      line_items,
      mode: "payment",
      metadata: { purchaseId: newPurchase._id.toString() },
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error("Error in purchaseCourse:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
