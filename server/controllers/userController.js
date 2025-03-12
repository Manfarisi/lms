import User from "../models/user.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgres.js";

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
        res.json({success: true, enrolledCourses: userData.enrolledCourses})
        // userEndoledCosrse

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


// update user course progrs
export const updateUserCourseProgress = async (req,res)=>{
  try{
    const userId = req.auth.userId
    const {courseId, lectureId} = req.body
    const progressData = await CourseProgress.findOne({userId, courseId})

    if(progressData){
      if(progressData.lectureCompleted.includes(lectureId)){
        return res.json({success: true, message: 'Lecture Already Completed'})
      }
      progressData.lectureCompleted.push(lectureId)
      await progressData.save()
    }else{
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId]
      })
    }

    res.json({success: true, message: 'Progress Updated'})
  }
  catch(error){
    res.json({success: false, message: error.message})
  }
}

// get user course progress
export const getUserCoursesProgress = async(req,res)=>{
  try {
    const userId = req.auth.userId
    const {courseId} = req.body
    const progressData = await CourseProgress.findOne({userId, courseId})

    res.json({success: true, progressData})
  } catch (error) {
    res.json({success: false, message: error.message})

  }
}

// add user rating to course
export const addUserRating = async (req, res) => {
  const userId = req.auth.userId
  const { courseId, rating } = req.body

  if(!courseId || !userId || !rating || rating < 1 || rating > 5){
    return res.json({success: false, message: 'Invalid Details'})
  }
  try {
    const course = await Course.findById(courseId)
    if(!course){
      return res.json({success: false, message: 'Course Not Found'})
    }
    const user = await User.findById(userId)

    if(!user || !user.enrolledCourses.includes(courseId)){
      return res.json({success: false, message: 'User has Not purchased this Course'})
    }

    const existingRatingIndex = course.courseRating.findIndex(r => r.userId === userId)

    if(existingRatingIndex > -1){
      course.courseRating[existingRatingIndex].rating = rating
    }else{
      course.courseRating.push({userId, rating})
    }
    await course.save()

    return res.json({success: true, message: 'Rating added'})
  } catch (error) {
    return res.json({success:false, message: error.message})
    
  }
}