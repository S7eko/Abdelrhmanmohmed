"use client";

import React, { useState, useEffect } from "react";
import classes from "../../style/Addcontent.module.css";
import Swal from "sweetalert2";

const AddContent = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sections, setSections] = useState([{ sectionName: "", lectures: [{ lectureName: "", videoFile: null }] }]);
  const [formKey, setFormKey] = useState(0); // المفتاح لإعادة تحميل الفورم
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token is missing");

        const response = await fetch("https://skillbridge.runasp.net/api/Courses/instructor", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);

        const data = await response.json();
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && Array.isArray(data.data)) {
          setCourses(data.data);
        } else {
          throw new Error("Invalid data format: Expected an array");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const resetForm = () => {
    setSelectedCourse("");
    setSections([{ sectionName: "", lectures: [{ lectureName: "", videoFile: null }] }]);
    setUploadProgress(0);
    setFormKey(prev => prev + 1); // إعادة رسم الفورم
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to cancel and reset the form?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, reset it!'
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
        Swal.fire('Reset!', 'The form has been reset.', 'success');
      }
    });
  };

  const handleCourseChange = (e) => setSelectedCourse(e.target.value);

  const handleSectionNameChange = (index, value) => {
    const updatedSections = [...sections];
    updatedSections[index].sectionName = value;
    setSections(updatedSections);
  };

  const addLecture = (index) => {
    const updatedSections = [...sections];
    updatedSections[index].lectures.push({ lectureName: "", videoFile: null });
    setSections(updatedSections);
  };

  const handleLectureChange = (sectionIndex, lectureIndex, field, value) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lectures[lectureIndex][field] = value;
    setSections(updatedSections);
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a course" });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      let totalSections = sections.length;
      let completedSections = 0;

      for (const section of sections) {
        if (!section.sectionName.trim()) {
          Swal.fire({ icon: "warning", title: "Warning", text: "Please enter section name" });
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("SectionName", section.sectionName);

        section.lectures.forEach((lecture, index) => {
          formData.append(`Lectures[${index}].Title`, lecture.lectureName);
          if (lecture.videoFile) {
            formData.append(`Lectures[${index}].Video`, lecture.videoFile);
          }
        });

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const sectionProgress = (event.loaded / event.total) * 100;
            const overallProgress = (completedSections / totalSections) * 100 + (sectionProgress / totalSections);
            setUploadProgress(Math.round(overallProgress));
          }
        });

        await new Promise((resolve, reject) => {
          xhr.open("POST", `https://skillbridge.runasp.net/api/Sections/${selectedCourse}`);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(xhr.statusText));
          xhr.onerror = () => reject(xhr.statusText);
          xhr.send(formData);
        });

        completedSections++;
        setUploadProgress((completedSections / totalSections) * 100);
      }

      Swal.fire({ icon: "success", title: "Success", text: "Content saved successfully!" });
      resetForm();
    } catch (error) {
      console.error("Save Error:", error);
      Swal.fire({ icon: "error", title: "Error", text: `Failed to save content: ${error}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={classes.container} key={formKey}>
      <div className={classes.form}>
        <div className={classes.SelectCourse}>
          <label>Select Course:</label>
          <select value={selectedCourse} onChange={handleCourseChange}>
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={classes.secation}>
            <label>Section Name:</label>
            <input
              type="text"
              value={section.sectionName}
              onChange={(e) => handleSectionNameChange(sectionIndex, e.target.value)}
              placeholder="Section Name"
            />
            {section.lectures.map((lecture, lectureIndex) => (
              <div key={lectureIndex} className={classes.lecture}>
                <input
                  type="text"
                  value={lecture.lectureName}
                  placeholder="Lecture Name"
                  onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, "lectureName", e.target.value)}
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, "videoFile", e.target.files[0])}
                />
              </div>
            ))}
            <button onClick={() => addLecture(sectionIndex)} className={classes.AddNewContent}>
              + Add Lecture
            </button>
          </div>
        ))}

        <div className={classes.button}>
          <button className={classes.btn1} onClick={handleSave} disabled={isSubmitting}>
            <div className={classes.progressContainer}>
              <div className={classes.progressBar} style={{ width: `${uploadProgress}%` }}></div>
              <span className={classes.progressText}>
                {isSubmitting ? `${uploadProgress}% Uploading...` : "Save"}
              </span>
            </div>
          </button>
          <button className={classes.btn2} onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddContent;
