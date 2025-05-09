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
        title: "Warning",
        text: "You need to login first",
        icon: "warning",
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
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
      newErrors.title = "Title is required";
      isValid = false;
    }

    articleData.contentBlocks.forEach((block, index) => {
      if (!block.text.trim()) {
        newErrors.contentBlocks[index] = "Content is required";
        isValid = false;
      }
    });

    if (!imageFile) {
      newErrors.image = "Article image is required";
      isValid = false;
    } else if (imageFile.size > 2 * 1024 * 1024) {
      newErrors.image = "Image size should not exceed 2MB";
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
        title: "Success!",
        text: "Article published successfully",
        icon: "success",
        confirmButtonText: "OK"
      });

      // Reset form after success
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
        title: "Error!",
        text: error.message || "An error occurred while publishing the article",
        icon: "error",
        confirmButtonText: "OK"
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
        Swal.fire("Error!", "Image size should not exceed 2MB", "error");
        return;
      }
      setImageFile(file);
      setErrors(prev => ({ ...prev, image: "" }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      Swal.fire("Error!", "Please select an image in JPG or PNG format", "error");
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
      Swal.fire("Warning!", "Article must contain at least one paragraph", "warning");
      return;
    }
    const newBlocks = [...articleData.contentBlocks];
    newBlocks.splice(index, 1);
    setArticleData(prev => ({ ...prev, contentBlocks: newBlocks }));
  };

  return (
    <div className={classes.container_center}>
      <div className={classes.add_course}>
        <h2>Add New Article</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Title */}
          <div className={`${classes.form_group} ${errors.title ? classes.has_error : ""}`}>
            <label htmlFor="title">Article Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={articleData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter article title"
              className={errors.title ? classes.error_border : ""}
            />
            {errors.title && <span className={classes.error_message}>{errors.title}</span>}
          </div>

          {/* Category */}
          <div className={classes.form_group}>
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={articleData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Select category</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Game Development">Game Development</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Blockchain">Blockchain</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>

          {/* Article Image */}
          <div className={`${classes.form_group} ${errors.image ? classes.has_error : ""}`}>
            <label htmlFor="image">Article Image *</label>
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
                {imageFile ? imageFile.name : "Choose image (JPG/PNG - Max 2MB)"}
              </label>
            </div>
            {errors.image && <span className={classes.error_message}>{errors.image}</span>}
            {imagePreview && (
              <div className={classes.image_preview}>
                <img src={imagePreview} alt="Image preview" />
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className={classes.form_group}>
            <label htmlFor="excerpt">Article Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={articleData.excerpt}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter article excerpt"
              rows="5"
            />
          </div>

          {/* Content Blocks */}
          <div className={classes.form_group}>
            <label>Content Paragraphs *</label>
            {articleData.contentBlocks.map((block, index) => (
              <div key={index} className={`${classes.content_block_container} ${errors.contentBlocks[index] ? classes.has_error : ""}`}>
                <textarea
                  value={block.text}
                  onChange={(e) => handleContentBlockChange(index, e)}
                  disabled={isSubmitting}
                  placeholder={`Paragraph ${index + 1}`}
                  rows="3"
                  className={errors.contentBlocks[index] ? classes.error_border : ""}
                />
                {errors.contentBlocks[index] && (
                  <span className={classes.error_message}>
                    {errors.contentBlocks[index]}
                  </span>
                )}

                {/* Optional image for each paragraph */}
                <div className={classes.form_group}>
                  <label htmlFor={`blockImage-${index}`}>Paragraph Image (optional)</label>
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
                        Swal.fire("Error!", "Please select an image in JPG or PNG format", "error");
                      }
                    }}
                  />
                  {block.imagePreview && (
                    <div className={classes.image_preview}>
                      <img src={block.imagePreview} alt={`Paragraph ${index} preview`} />
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
                    Remove Paragraph
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
              Add New Paragraph
            </button>
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
                  Publishing...
                </>
              ) : (
                "Publish Article"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddArticle;