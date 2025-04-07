"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode"; // ✅ تثبيت الحزمة: npm install jwt-decode
import classes from "../../style/AddCourse.module.css";

const AddCourse = () => {
  const [courseData, setCourseData] = useState({
    title: "",
    language: "English",
    level: "",
    subTitle: "",
    description: "",
    categoryId: "1",
    requirements: [], // سيتم تخزينها ككائنات JSON
    learnings: [], // سيتم تخزينها ككائنات JSON
    published: true,
  });

  const categories = [
    { id: 1, name: "IT & Software" },
    { id: 2, name: "Languages" },
    { id: 3, name: "Music" },
    { id: 4, name: "Productivity" },
    { id: 5, name: "Marketing" },
    { id: 6, name: "Business" },
  ];

  const [tempRequirement, setTempRequirement] = useState(""); // نص مؤقت للـ Requirements
  const [tempLearning, setTempLearning] = useState(""); // نص مؤقت للـ Learnings
  const [imageFile, setImageFile] = useState(null); // حالة لتخزين ملف الصورة

  // ✅ جلب التوكن والتحقق من تسجيل الدخول
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: "Error!",
        text: "You must log in first",
        icon: "error",
      }).then(() => {
        window.location.href = "/login"; // ✅ توجيه المستخدم لصفحة تسجيل الدخول
      });
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setCourseData((prevData) => ({
        ...prevData,
        instructor: decodedToken.name || "",
      }));
    } catch (error) {
      console.error("Invalid token", error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // تخزين ملف الصورة
    }
  };

  const handleAddRequirement = () => {
    if (tempRequirement.trim()) {
      const newRequirement = { name: tempRequirement }; // تحويل النص إلى كائن JSON
      setCourseData((prevData) => ({
        ...prevData,
        requirements: [...prevData.requirements, newRequirement],
      }));
      setTempRequirement(""); // مسح الحقل بعد الإضافة
    }
  };

  const handleCancelRequirement = () => {
    setTempRequirement(""); // مسح النص المؤقت دون حفظ
  };

  const handleAddLearning = () => {
    if (tempLearning.trim()) {
      const newLearning = { name: tempLearning }; // تحويل النص إلى كائن JSON
      setCourseData((prevData) => ({
        ...prevData,
        learnings: [...prevData.learnings, newLearning],
      }));
      setTempLearning(""); // مسح الحقل بعد الإضافة
    }
  };

  const handleCancelLearning = () => {
    setTempLearning(""); // مسح النص المؤقت دون حفظ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({ title: "Error!", text: "You must log in first", icon: "error" });
      return;
    }

    try {
      const formData = new FormData(); // إنشاء FormData

      // إضافة البيانات إلى FormData
      formData.append("Title", courseData.title);
      formData.append("Language", courseData.language);
      formData.append("Level", courseData.level);
      formData.append("SubTitle", courseData.subTitle);
      formData.append("Description", courseData.description);
      formData.append("CategoryId", courseData.categoryId);
      formData.append("Requirements", JSON.stringify(courseData.requirements)); // تحويل القائمة إلى JSON
      formData.append("Learnings", JSON.stringify(courseData.learnings)); // تحويل القائمة إلى JSON
      formData.append("Published", courseData.published);
      if (imageFile) {
        formData.append("Image", imageFile); // إضافة ملف الصورة
      }

      const response = await fetch("http://skillbridge.runasp.net/api/courses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // إرسال FormData
      });

      if (!response.ok) {
        throw new Error("Failed to add course");
      }

      Swal.fire({ title: "Success!", text: "Course added successfully!", icon: "success" });

      // إعادة تعيين الحقول بعد الإرسال الناجح
      setCourseData({
        title: "",
        language: "English",
        level: "",
        subTitle: "",
        description: "",
        categoryId: "1",
        requirements: [],
        learnings: [],
        published: true,
      });
      setImageFile(null); // إعادة تعيين ملف الصورة
    } catch (error) {
      Swal.fire({ title: "Error!", text: error.message, icon: "error" });
    }
  };

  return (
    <div className={classes.container_center}>
      <div className={classes.add_course}>
        <h2>Add New Course</h2>
        <form onSubmit={handleSubmit}>
          {/* Instructor */}
          

          {/* Course Title */}
          <div className={classes.form_group}>
            <label htmlFor="title">Course Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Course Subtitle */}
          <div className={classes.form_group}>
            <label htmlFor="subTitle">Course Subtitle</label>
            <input
              type="text"
              id="subTitle"
              name="subTitle"
              value={courseData.subTitle}
              onChange={handleChange}
              required
            />
          </div>

          {/* Course Category */}
          <div className={classes.form_group}>
            <label htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={courseData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Image */}
          <div className={classes.form_group}>
            <label htmlFor="image">Course Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
          </div>

          {/* Description */}
          <div className={classes.form_group}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Course Level */}
          <div className={classes.form_group}>
            <label htmlFor="level">Course Level</label>
            <select id="level" name="level" value={courseData.level} onChange={handleChange} required>
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Requirements */}
          <div className={classes.form_group}>
            <label htmlFor="requirements">Requirements</label>
            <div>
              {courseData.requirements.map((req, index) => (
                <div key={index} className={classes.list_item}>
                  {req.name} {/* عرض الـ name من الكائن JSON */}
                </div>
              ))}
            </div>
            <textarea
              id="requirements"
              name="requirements"
              value={tempRequirement}
              onChange={(e) => setTempRequirement(e.target.value)}
              placeholder="Add a requirement"
            />
            <div className={classes.button_group}>
              <button type="button" onClick={handleAddRequirement} className={classes.save_button}>
                Save
              </button>
              <button type="button" onClick={handleCancelRequirement} className={classes.cancel_button}>
                Cancel
              </button>
            </div>
          </div>

          {/* Learnings */}
          <div className={classes.form_group}>
            <label htmlFor="learnings">What You'll Learn</label>
            <div>
              {courseData.learnings.map((learning, index) => (
                <div key={index} className={classes.list_item}>
                  {learning.name} {/* عرض الـ name من الكائن JSON */}
                </div>
              ))}
            </div>
            <textarea
              id="learnings"
              name="learnings"
              value={tempLearning}
              onChange={(e) => setTempLearning(e.target.value)}
              placeholder="Add what you'll learn"
            />
            <div className={classes.button_group}>
              <button type="button" onClick={handleAddLearning} className={classes.save_button}>
                Save
              </button>
              <button type="button" onClick={handleCancelLearning} className={classes.cancel_button}>
                Cancel
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className={classes.submit_button}>
            Add Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;