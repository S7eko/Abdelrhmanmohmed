import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "../../style/AddQuiz.module.css"; // استيراد ملف CSS

const AddQuiz = () => {
  const [courses, setCourses] = useState([]); // قائمة الكورسات
  const [selectedCourseId, setSelectedCourseId] = useState(""); // الكورس المحدد
  const [sections, setSections] = useState([]); // قائمة الأقسام
  const [selectedSectionId, setSelectedSectionId] = useState(""); // القسم المحدد
  const [quizzes, setQuizzes] = useState([
    {
      question: "",
      firstOption: "",
      secondOption: "",
      thirdOption: "",
      fourthOption: "",
      answer: "",
    },
  ]); // صفيف الأسئلة
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true); // حالة تحميل الكورسات
  const [isLoadingSections, setIsLoadingSections] = useState(false); // حالة تحميل الأقسام

  // جلب الكورسات الخاصة بالمدرس
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); // افترض أن الـ token محفوظ في localStorage
        const response = await fetch("https://skillbridge.runasp.net/api/Courses/instructor", {
          headers: {
            Authorization: `Bearer ${token}`, // إرسال الـ token في رأس الطلب
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data); // تعيين الكورسات
      } catch (error) {
        console.error("Error fetching courses:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load courses. Please try again later.",
        });
      } finally {
        setIsLoadingCourses(false); // إيقاف حالة التحميل
      }
    };

    fetchCourses();
  }, []);

  // جلب الأقسام بناءً على الكورس المحدد
  useEffect(() => {
    if (!selectedCourseId) return; // لا تجلب الأقسام إذا لم يتم اختيار كورس

    const fetchSections = async () => {
      setIsLoadingSections(true); // بدء حالة التحميل
      try {
        const token = localStorage.getItem("token"); // افترض أن الـ token محفوظ في localStorage
        const response = await fetch(
          `https://skillbridge.runasp.net/api/Courses/sectionsId/${selectedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // إرسال الـ token في رأس الطلب
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sections");
        }

        const data = await response.json();
        setSections(data); // تعيين الأقسام
      } catch (error) {
        console.error("Error fetching sections:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load sections. Please try again later.",
        });
      } finally {
        setIsLoadingSections(false); // إيقاف حالة التحميل
      }
    };

    fetchSections();
  }, [selectedCourseId]);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedQuizzes = [...quizzes];
    updatedQuizzes[index] = {
      ...updatedQuizzes[index],
      [name]: value,
    };
    setQuizzes(updatedQuizzes);
  };

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value); // تحديث الكورس المحدد
    setSelectedSectionId(""); // إعادة تعيين القسم المحدد
  };

  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value); // تحديث القسم المحدد
  };

  const addQuizField = () => {
    setQuizzes([
      ...quizzes,
      {
        question: "",
        firstOption: "",
        secondOption: "",
        thirdOption: "",
        fourthOption: "",
        answer: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSectionId) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select a section",
      });
      return;
    }

    // التحقق من أن جميع الحقول مملوءة
    for (const quiz of quizzes) {
      if (
        !quiz.question ||
        !quiz.firstOption ||
        !quiz.secondOption ||
        !quiz.thirdOption ||
        !quiz.fourthOption ||
        !quiz.answer
      ) {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "Please fill all fields for all quizzes",
        });
        return;
      }

      // التحقق من أن الإجابة الصحيحة تطابق أحد الخيارات
      const validAnswers = [
        quiz.firstOption,
        quiz.secondOption,
        quiz.thirdOption,
        quiz.fourthOption,
      ];

      if (!validAnswers.includes(quiz.answer)) {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "The correct answer must match one of the options",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token"); // افترض أن الـ token محفوظ في localStorage

      // إرسال البيانات إلى الـ API
      const response = await fetch(
        `https://skillbridge.runasp.net/api/Quizzes/${selectedSectionId}/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // إرسال الـ token في رأس الطلب
          },
          body: JSON.stringify(quizzes), // إرسال الأسئلة كـ JSON
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save quizzes");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Quizzes saved successfully!",
      });

      // إعادة تعيين الحقول بعد الحفظ
      setQuizzes([
        {
          question: "",
          firstOption: "",
          secondOption: "",
          thirdOption: "",
          fourthOption: "",
          answer: "",
        },
      ]);
    } catch (error) {
      console.error("Error saving quizzes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to save quizzes: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCourses) {
    return <div>Loading courses...</div>; // عرض رسالة تحميل الكورسات
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Course:</label>
          <select
            value={selectedCourseId}
            onChange={handleCourseChange}
            className={styles.input}
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Section:</label>
            <select
              value={selectedSectionId}
              onChange={handleSectionChange}
              className={styles.input}
              required
              disabled={isLoadingSections}
            >
              <option value="">Select a section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.sectionName}
                </option>
              ))}
            </select>
            {isLoadingSections && <div>Loading sections...</div>}
          </div>
        )}

        {quizzes.map((quiz, index) => (
          <div key={index}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Question:</label>
              <input
                type="text"
                name="question"
                value={quiz.question}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Enter question"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Option:</label>
              <input
                type="text"
                name="firstOption"
                value={quiz.firstOption}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Enter first option"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Second Option:</label>
              <input
                type="text"
                name="secondOption"
                value={quiz.secondOption}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Enter second option"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Third Option:</label>
              <input
                type="text"
                name="thirdOption"
                value={quiz.thirdOption}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Enter third option"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fourth Option:</label>
              <input
                type="text"
                name="fourthOption"
                value={quiz.fourthOption}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Enter fourth option"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Correct Answer:</label>
              <input
                type="text"
                name="answer"
                value={quiz.answer}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Enter correct answer"
                className={styles.input}
                required
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={addQuizField} className={styles.button}>
          Add Another Quiz
        </button>

        <button
          type="submit"
          className={styles.button}
          disabled={isSubmitting || !selectedSectionId}
        >
          {isSubmitting ? "Saving..." : "Save Quizzes"}
        </button>
      </form>
    </div>
  );
};

export default AddQuiz;