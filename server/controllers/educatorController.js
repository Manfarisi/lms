import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/Purchase.js";
import User from "../models/user.js";

// update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });
    res.json({ success: true, message: "you can publish a course now" });
  } catch (error) {
    res.json({ success: false, meesage: error.message });
  }
};

// add new course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res.json({ success: false, message: "Thumbnail not attached" });
    }
    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    const newCourse = await Course.create(parsedCourseData);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.json({ success: true, message: "Course Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get educator courses
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GEt educator dashboard data( total earning, enroled studen. no, course)

export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map((course) => course._id);
    // calculate total earning from purchases
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchases) => sum + purchases.amount,
      0
    );

    // colect unique enrolled student ID with theri course titles
    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );

      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get enroled studen data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course.id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const {
      courseTitle,
      courseDescription,
      coursePrice,
      discount,
      lectureForm,
    } = JSON.parse(req.body.courseData);
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Course ID is required" });
    }

    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (existingCourse.educator.toString() !== educatorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this course",
      });
    }

    // Menyimpan data yang akan diperbarui
    const updatedData = {
      courseTitle: courseTitle || existingCourse.courseTitle,
      courseDescription: courseDescription || existingCourse.courseDescription,
      discount: discount || existingCourse.discount,
      coursePrice: coursePrice || existingCourse.coursePrice,
      lectureForm: lectureForm || existingCourse.lectureForm,
    };

    // Jika ada file gambar yang diupload, update courseThumbnail
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      updatedData.courseThumbnail = imageUpload.secure_url;
    }

    // Update course
    await Course.updateOne({ _id: courseId }, { $set: updatedData });

    // Ambil ulang course dari database setelah update
    const updatedCourse = await Course.findById(courseId);

    console.log("Updated Course:", updatedCourse); // Debugging

    res.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const educatorId = req.auth.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (course.educator.toString() !== educatorId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this course",
      });
    }

    // Hapus gambar dari Cloudinary jika ada
    if (course.courseThumbnail) {
      const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Course.findByIdAndDelete(courseId);

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
