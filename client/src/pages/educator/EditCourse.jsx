import React, { useContext, useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams } from "react-router-dom";

const EditCourse = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const { id, courseId, chapterId } = useParams();
  console.log("courseId:", courseId, "chapterId:", chapterId);



  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [courseDescription, setCourseDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [editingLecture, setEditingLecture] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [lectureId, setLectureId] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    chapterId: "",
    lectureIndex: null,
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChapter = (action, chapterId, chapterIndex) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name");
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === "remove") {
      setChapters(
        chapters.filter((chapter) => chapter.chapterId !== chapterId)
      );
    } else if (action === "toggle") {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    } else if (action === "edit") {
      // Handle edit action
      const newTitle = prompt(
        "Enter New Chapter Name",
        chapters[chapterIndex].chapterTitle
      ); // Pre-fill with existing title
      if (newTitle) {
        setChapters(
          chapters.map((chapter, index) =>
            index === chapterIndex
              ? { ...chapter, chapterTitle: newTitle }
              : chapter
          )
        );
      }
    }
  };

  const handleLecture = (action, chapterId, lectureIndex, lecture) => {
    if (action === "edit") {
      setLectureForm({
        chapterId,
        lectureTitle: lecture.lectureTitle,
        lectureDuration: lecture.lectureDuration,
        lectureUrl: lecture.lectureUrl,
        isPreviewFree: lecture.isPreviewFree,
      });
      setLectureId(lecture._id); // Tambahkan ini
      setEditingLecture({ chapterId, lectureIndex }); // Menyimpan indeks yang sedang diedit
      setIsEditing(true);
    }
  };

  // Fungsi untuk menyimpan perubahan saat edit
  const handleUpdateLecture = async () => {
    try {
      const token = await getToken();
      if (!courseId || !chapterId || !lectureId) {
        alert("Missing courseId, chapterId, or lectureId");
        return;
      }

      console.log("Lecture ID:", lectureId);

      const updatedLecture = {
        _id: lectureId,
        lectureTitle: lectureForm.lectureTitle,
        lectureDuration: lectureForm.lectureDuration,
        lectureUrl: lectureForm.lectureUrl,
        isPreviewFree: lectureForm.isPreviewFree,
      };

      const response = await axios.put(
        `${backendUrl}/api/educator/course/edit-lecture`,
        { courseId, chapterId, lectureData: updatedLecture },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Lecture updated successfully!");
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert("Failed to update lecture.");
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/educator/course/${courseId}`
        );
        if (!response.data.course) {
          console.error("Course data is undefined");
          return;
        }

        if (response.data.course.lecture?.length > 0) {
          setLectureId(response.data.course.lecture[0]?._id);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleLectureDelete = async (chapterId, lectureId) => {
    try {
      console.log("Deleting lecture with ID:", lectureId);
        const token = await getToken();
        const response = await axios.delete(
            `${backendUrl}/api/educator/course/${id}/chapter/${chapterId}/lecture/${lectureId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (response.data.success) {
            setChapters((prev) =>
                prev.map((chapter) =>
                    chapter.chapterId === chapterId
                        ? {
                            ...chapter,
                            chapterContent: chapter.chapterContent.filter(
                                (lecture) => lecture._id !== lectureId
                            ),
                        }
                        : chapter
                )
            );
            toast.success("Lecture deleted successfully");
        } else {
            toast.error("Failed to delete lecture");
        }
    } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting lecture");
    }
};



  //

  // 🔹 Fungsi untuk Fetch Data Course
  const fetchCourseData = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${backendUrl}/api/educator/course/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const { course } = response.data;
        setCourseTitle(course.courseTitle);
        setCoursePrice(course.coursePrice);
        setDiscount(course.discount);
        setImage(course.courseThumbnail);
        setChapters(course.courseContent);
        if (quillRef.current) {
          quillRef.current.root.innerHTML = course.courseDescription;
        }
      } else {
        toast.error("Failed to fetch course data");
      }
    } catch (error) {
      toast.error("Error fetching course data");
    }
  };

  // 🔹 Fungsi untuk Submit Edit Course
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      if (image instanceof File) {
        formData.append("image", image);
      }

      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/educator/course/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          fetchCourseData(); // ✅ Panggil ulang fetchCourseData untuk memperbarui tampilan tanpa refresh
        }, 500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // 🔹 Gunakan useEffect untuk Fetch Data saat Komponen Dimuat
  useEffect(() => {
    const loadData = async () => {
      await fetchCourseData();
    };
    loadData();
  }, [id, backendUrl]);

  // 🔹 Gunakan useEffect untuk Update Thumbnail saat Image Berubah
  useEffect(() => {
    if (image instanceof File) {
      setThumbnailUrl(URL.createObjectURL(image));
    } else {
      setThumbnailUrl(image);
    }
  }, [image]);

  // 🔹 Gunakan useEffect untuk Menginisialisasi Quill
  useEffect(() => {
    if (quillRef.current && courseDescription) {
      quillRef.current.root.innerHTML = courseDescription;
    }
  }, [courseDescription]);

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
      });
    }
  }, []);

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 pt-8 pb-0">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md w-full text-gray-500"
      >
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            required
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        <div className="flex items-center justify-between flex-wrap">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              type="number"
              value={coursePrice}
              onChange={(e) =>
                setCoursePrice(Math.max(0, Number(e.target.value)))
              }
              required
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p>Discount %</p>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              required
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            />
          </div>{" "}
        </div>


        <div className="flex md:flex-row flex-col items-center gap-3">
          <p>Course Thumbnail</p>
          <label htmlFor="thumbnailImage" className="flex items-center gap-3">
            <img
              src={assets.file_upload_icon}
              alt=""
              className="p-3 bg-blue-500 rounded"
            />
            <input
              type="file"
              id="thumbnailImage"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              hidden
            />
            <img
              src={thumbnailUrl || " "}
              alt="Course Thumbnail"
              className="max-h-10"
            />
          </label>
        </div>

        <button
          type="submit"
          className="px-8 rounded my-4 bg-black text-white w-max py-2.5"
        >
          Update Course
        </button>
      </form>
    </div>
  );
};

export default EditCourse;
