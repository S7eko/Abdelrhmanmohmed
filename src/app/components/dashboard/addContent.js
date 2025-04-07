"use client";

import React, { useState, useEffect } from "react";
import classes from "../../style/Addcontent.module.css";
import Swal from "sweetalert2";

const AddContent = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sections, setSections] = useState([{ sectionName: "", lectures: [{ lectureName: "", videoFile: null }] }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token is missing");
        }

        const response = await fetch("http://skillbridge.runasp.net/api/Courses/instructor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // Debugging
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

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

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
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select a course",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      for (const section of sections) {
        if (!section.sectionName.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: "Please enter section name",
          });
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

        const response = await fetch(
          `http://skillbridge.runasp.net/api/Sections/${selectedCourse}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const result = await response.text();
        console.log("API Response:", result);

        if (!response.ok) {
          throw new Error(result || "Failed to save content");
        }
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Content saved successfully!",
      });

      setSelectedCourse("");
      setSections([{ sectionName: "", lectures: [{ lectureName: "", videoFile: null }] }]);
    } catch (error) {
      console.error("Save Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to save content: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={classes.container}>
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
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button className={classes.btn2} onClick={() => setSections([{ sectionName: "", lectures: [{ lectureName: "", videoFile: null }] }])}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContent;