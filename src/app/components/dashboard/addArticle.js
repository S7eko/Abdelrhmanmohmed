"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import classes from "../../style/addArticle.module.css";
import { FaSpinner } from "react-icons/fa";

const AddArticle = () => {
  const [articleData, setArticleData] = useState({
    title: "",
    category: "",
    excerpt: "",
    contentBlocks: [{ type: "text", text: "", imageFile: null, imagePreview: "" }],
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("Title", articleData.title.trim());
      formData.append("Category", articleData.category);
      formData.append("Image", imageFile);
      formData.append("Excerpt", articleData.excerpt.trim());
      formData.append("PublishDate", new Date(articleData.publishDate).toISOString());
      formData.append("ReadTime", articleData.readTime.toString());

      articleData.contentBlocks.forEach((block, index) => {
        formData.append(`ContentBlocks[${index}].Type`, "text");
        formData.append(`ContentBlocks[${index}].Text`, block.text.trim());

        if (block.imageFile) {
          formData.append(`ContentBlocks[${index}].Image`, block.imageFile);
        }
      });

      const token = localStorage.getItem("token");
      const response = await fetch("https://skillbridge.runasp.net/api/Blogs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

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

      // إعادة تعيين النموذج بعد النجاح
      setArticleData({
        title: "",
        category: "",
        excerpt: "",
        contentBlocks: [{ type: "text", text: "", imageFile: null, imagePreview: "" }],
        publishDate: new Date().toISOString().slice(0, 16),
        readTime: 5,
      });
      setImageFile(null);
      setImagePreview("");

    } catch (error) {
      console.error("Submission error:", error);

      Swal.fire({
        title: "خطأ!",
        text: error.message || "حدث خطأ أثناء محاولة نشر المقال",
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match(/image\/(jpeg|jpg|png)/)) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("خطأ!", "حجم الصورة يجب ألا يتجاوز 2MB", "error");
        return;
      }
      setImageFile(file);
      setErrors(prev => ({ ...prev, image: "" }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      Swal.fire("خطأ!", "يرجى اختيار صورة بصيغة JPG أو PNG", "error");
    }
  };

  const handleContentBlockChange = (index, e) => {
    const newBlocks = [...articleData.contentBlocks];
    newBlocks[index].text = e.target.value;
    setArticleData(prev => ({ ...prev, contentBlocks: newBlocks }));
    if (errors.contentBlocks[index]) {
      const updatedErrors = [...errors.contentBlocks];
      updatedErrors[index] = "";
      setErrors(prev => ({ ...prev, contentBlocks: updatedErrors }));
    }
  };

  const handleContentBlockImageChange = (index, file) => {
    const newBlocks = [...articleData.contentBlocks];
    newBlocks[index].imageFile = file;

    const reader = new FileReader();
    reader.onloadend = () => {
      newBlocks[index].imagePreview = reader.result;
      setArticleData(prev => ({ ...prev, contentBlocks: newBlocks }));
    };
    reader.readAsDataURL(file);
  };

  const addContentBlock = () => {
    setArticleData(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, { type: "text", text: "", imageFile: null, imagePreview: "" }]
    }));
  };

  const removeContentBlock = (index) => {
    if (articleData.contentBlocks.length <= 1) {
      Swal.fire("تحذير!", "يجب أن يحتوي المقال على فقرة واحدة على الأقل", "warning");
      return;
    }
    const newBlocks = [...articleData.contentBlocks];
    newBlocks.splice(index, 1);
    setArticleData(prev => ({ ...prev, contentBlocks: newBlocks }));
  };

  return (
    <div className={classes.container_center}>
      <div className={classes.add_course}>
        <h2>إضافة مقال جديد</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* العنوان */}
          <div className={`${classes.form_group} ${errors.title ? classes.has_error : ""}`}>
            <label htmlFor="title">عنوان المقال *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={articleData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="أدخل عنوان المقال"
              className={errors.title ? classes.error_border : ""}
            />
            {errors.title && <span className={classes.error_message}>{errors.title}</span>}
          </div>

          {/* التصنيف */}
          <div className={classes.form_group}>
            <label htmlFor="category">التصنيف *</label>
            <select
              id="category"
              name="category"
              value={articleData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">اختر التصنيف</option>
              <option value="Web Development">تطوير الويب</option>
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

          {/* صورة المقال */}
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

          {/* الملخص */}
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

          {/* الفقرات */}
          <div className={classes.form_group}>
            <label>فقرات المحتوى *</label>
            {articleData.contentBlocks.map((block, index) => (
              <div key={index} className={`${classes.content_block_container} ${errors.contentBlocks[index] ? classes.has_error : ""}`}>
                <textarea
                  value={block.text}
                  onChange={(e) => handleContentBlockChange(index, e)}
                  disabled={isSubmitting}
                  placeholder={`فقرة ${index + 1}`}
                  rows="3"
                  className={errors.contentBlocks[index] ? classes.error_border : ""}
                />
                {errors.contentBlocks[index] && (
                  <span className={classes.error_message}>
                    {errors.contentBlocks[index]}
                  </span>
                )}

                {/* صورة اختيارية لكل فقرة */}
                <div className={classes.form_group}>
                  <label htmlFor={`blockImage-${index}`}>صورة الفقرة (اختياري)</label>
                  <input
                    type="file"
                    id={`blockImage-${index}`}
                    accept="image/*"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type.match(/image\/(jpeg|jpg|png)/)) {
                        handleContentBlockImageChange(index, file);
                      } else {
                        Swal.fire("خطأ!", "الرجاء اختيار صورة بصيغة JPG أو PNG", "error");
                      }
                    }}
                  />
                  {block.imagePreview && (
                    <div className={classes.image_preview}>
                      <img src={block.imagePreview} alt={`معاينة الفقرة ${index}`} />
                    </div>
                  )}
                </div>

                {articleData.contentBlocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContentBlock(index)}
                    className={classes.remove_button}
                    disabled={isSubmitting}
                  >
                    حذف الفقرة
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

          {/* زر الإرسال */}
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
