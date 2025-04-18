"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import classes from "../../style/AddCourse.module.css";
import { FaSpinner } from "react-icons/fa";

const AddArticle = () => {
  const [articleData, setArticleData] = useState({
    title: "",
    category: "",
    excerpt: "",
    contentBlocks: [{ type: "text", text: "" }],
    publishDate: new Date().toISOString().slice(0, 16),
    readTime: 5,
  });

  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({
    title: "",
    contentBlocks: [],
    image: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تحذير",
        text: "يجب تسجيل الدخول أولاً",
        icon: "warning",
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إلغاء",
        showCancelButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        } else {
          window.location.href = "/";
        }
      });
    }
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      contentBlocks: [],
      image: ""
    };

    if (!articleData.title.trim()) {
      newErrors.title = "العنوان مطلوب";
      isValid = false;
    }

    articleData.contentBlocks.forEach((block, index) => {
      if (!block.text.trim()) {
        newErrors.contentBlocks[index] = "محتوى الفقرة مطلوب";
        isValid = false;
      } 
    });

    if (!imageFile) {
      newErrors.image = "صورة المقال مطلوبة";
      isValid = false;
    } else if (imageFile.size > 2 * 1024 * 1024) {
      newErrors.image = "حجم الصورة يجب ألا يتجاوز 2MB";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data according to API requirements
      const formData = new FormData();
      formData.append("Title", articleData.title.trim());
      formData.append("Category", articleData.category);
      formData.append("Image", imageFile);
      formData.append("Excerpt", articleData.excerpt.trim());

      articleData.contentBlocks.forEach((block, index) => {
        formData.append(`ContentBlocks[${index}].Type`, "text");
        formData.append(`ContentBlocks[${index}].Text`, block.text.trim());
      });

      formData.append("PublishDate", new Date(articleData.publishDate).toISOString());
      formData.append("ReadTime", articleData.readTime.toString());

      const token = localStorage.getItem("token");
      const response = await fetch("https://skillbridge.runasp.net/api/Blogs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      // Handle both JSON and text responses
      let responseData;
      const responseText = await response.text();
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }

      await Swal.fire({
        title: "تم بنجاح!",
        text: "تم نشر المقال بنجاح",
        icon: "success",
        confirmButtonText: "حسناً"
      });

    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "حدث خطأ أثناء محاولة نشر المقال";
      if (error.message.includes("400")) {
        errorMessage = "بيانات غير صالحة. يرجى التحقق من:";
        errorMessage += "\n- أن جميع الحقول المطلوبة مملوءة";
        errorMessage += "\n- أن الصورة بصيغة صالحة (JPG, PNG)";
        errorMessage += "\n- أن تاريخ النشر صحيح";
      }

      Swal.fire({
        title: "خطأ!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "حسناً"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticleData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image type
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        Swal.fire("خطأ!", "يجب اختيار صورة بصيغة JPG أو PNG", "error");
        return;
      }

      // Validate image size
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("خطأ!", "حجم الصورة يجب ألا يتجاوز 2MB", "error");
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleContentBlockChange = (index, e) => {
    const newContentBlocks = [...articleData.contentBlocks];
    newContentBlocks[index] = {
      ...newContentBlocks[index],
      text: e.target.value
    };
    setArticleData(prev => ({ ...prev, contentBlocks: newContentBlocks }));

    // Clear error when user types
    if (errors.contentBlocks[index]) {
      const newErrorBlocks = [...errors.contentBlocks];
      newErrorBlocks[index] = "";
      setErrors(prev => ({ ...prev, contentBlocks: newErrorBlocks }));
    }
  };

  const addContentBlock = () => {
    setArticleData(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, { type: "text", text: "" }]
    }));
  };

  const removeContentBlock = (index) => {
    if (articleData.contentBlocks.length <= 1) {
      Swal.fire("تحذير!", "يجب أن يحتوي المقال على فقرة واحدة على الأقل", "warning");
      return;
    }
    const newContentBlocks = [...articleData.contentBlocks];
    newContentBlocks.splice(index, 1);
    setArticleData(prev => ({ ...prev, contentBlocks: newContentBlocks }));
  };

  return (
    <div className={classes.container_center}>
      <div className={classes.add_course}>
        <h2>إضافة مقال جديد</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Title Field */}
          <div className={`${classes.form_group} ${errors.title ? classes.has_error : ""}`}>
            <label htmlFor="title">عنوان المقال *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={articleData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="أدخل عنوان المقال "
              className={errors.title ? classes.error_border : ""}
            />
            {errors.title && <span className={classes.error_message}>{errors.title}</span>}
          </div>

          {/* Category Field */}
          <div className={classes.form_group}>
            <label htmlFor="category">التصنيف *</label>
            <select
              id="category"
              name="category"
              value={articleData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            ><option value="Web Development">تطوير الويب</option>
              <option value="Mobile Development">تطوير التطبيقات</option>
              <option value="Artificial Intelligence">الذكاء الاصطناعي</option>
              <option value="Data Science">علوم البيانات</option>
              <option value="Machine Learning">التعلم الآلي</option>
              <option value="Cybersecurity">الأمن السيبراني</option>
              <option value="Game Development">تطوير الألعاب</option>
              <option value="Cloud Computing">الحوسبة السحابية</option>
              <option value="Blockchain">البلوك تشين</option>
              <option value="Software Engineering">هندسة البرمجيات</option>
            
            </select>
          </div>

          {/* Image Field */}
          <div className={`${classes.form_group} ${errors.image ? classes.has_error : ""}`}>
            <label htmlFor="image">صورة المقال الرئيسية *</label>
            <div className={classes.file_input_container}>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/jpeg, image/png"
                disabled={isSubmitting}
                className={errors.image ? classes.error_border : ""}
              />
              <label htmlFor="image" className={classes.file_input_label}>
                {imageFile ? imageFile.name : "اختر صورة (JPG/PNG - 2MB كحد أقصى)"}
              </label>
            </div>
            {errors.image && <span className={classes.error_message}>{errors.image}</span>}
            {imagePreview && (
              <div className={classes.image_preview}>
                <img src={imagePreview} alt="معاينة الصورة" />
              </div>
            )}
          </div>

          {/* Excerpt Field */}
          <div className={classes.form_group}>
            <label htmlFor="excerpt">ملخص المقال</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={articleData.excerpt}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="أدخل ملخصاً للمقال"
              rows="5"
            />
          </div>

          {/* Content Blocks */}
          <div className={classes.form_group}>
            <label>فقرات المحتوى *</label>
            {articleData.contentBlocks.map((block, index) => (
              <div key={index} className={`${classes.content_block_container} ${errors.contentBlocks[index] ? classes.has_error : ""}`}>
                <textarea
                  value={block.text}
                  onChange={(e) => handleContentBlockChange(index, e)}
                  disabled={isSubmitting}
                  placeholder={`فقرة المحتوى ${index + 1} `}
                  rows="3"
                  className={errors.contentBlocks[index] ? classes.error_border : ""}
                />
                {errors.contentBlocks[index] && (
                  <span className={classes.error_message}>
                    {errors.contentBlocks[index]}
                  </span>
                )}
                {articleData.contentBlocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContentBlock(index)}
                    className={classes.remove_button}
                    disabled={isSubmitting}
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addContentBlock}
              className={classes.add_button}
              disabled={isSubmitting}
            >
              إضافة فقرة جديدة
            </button>
          </div>

          {/* Publish Date */}
          <div className={classes.form_group}>
            <label htmlFor="publishDate">تاريخ النشر *</label>
            <input
              type="datetime-local"
              id="publishDate"
              name="publishDate"
              value={articleData.publishDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Read Time */}
          <div className={classes.form_group}>
            <label htmlFor="readTime">مدة القراءة (دقائق) *</label>
            <input
              type="number"
              id="readTime"
              name="readTime"
              value={articleData.readTime}
              onChange={handleChange}
              min="1"
              max="120"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className={classes.form_actions}>
            <button
              type="submit"
              className={classes.submit_button}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className={classes.spinner_icon} />
                  جاري النشر...
                </>
              ) : (
                "نشر المقال"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddArticle;