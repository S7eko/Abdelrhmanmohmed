"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay, faPlay, faFilePdf, faDownload, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "../style/video.module.css";

const Video = () => {
  // State management
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [downloadingFile, setDownloadingFile] = useState(null);

  // Constants
  const API_BASE_URL = "http://skillbridge.runasp.net";
  const UPLOADS_BASE_PATH = "/uploads/";

  // Router and search params
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("id");

  // Fetch course details and sections
  useEffect(() => {
    if (courseId) {
      const fetchCourseDetails = async () => {
        try {
          setIsLoading(true);

          // Fetch course details
          const courseResponse = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
          if (!courseResponse.ok) {
            throw new Error("Failed to fetch course details");
          }
          const courseData = await courseResponse.json();
          setCourse(courseData);

          // Check if the user is authenticated
          const token = localStorage.getItem("token");
          if (!token) {
            Swal.fire({
              title: "خطأ في المصادقة",
              text: "يجب تسجيل الدخول للوصول إلى محتوى الدورة",
              icon: "error",
              confirmButtonText: "حسناً"
            });
            setIsLoading(false);
            return;
          }

          // Fetch sections for the course
          const sectionsResponse = await fetch(`${API_BASE_URL}/api/Sections/${courseId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!sectionsResponse.ok) {
            throw new Error("Failed to fetch sections");
          }

          const sectionsData = await sectionsResponse.json();
          if (sectionsData.sections && Array.isArray(sectionsData.sections)) {
            const updatedSections = sectionsData.sections.map((section) => ({
              ...section,
              lectures: section.lectures?.map((lecture) => ({
                ...lecture,
                completed: localStorage.getItem(`lecture-${lecture.id}-completed`) === "true",
              })) || [],
              pdfFiles: section.pdfFiles || [],
              quizzes: section.quizzes || []
            }));
            setSections(updatedSections);
            setProgress(sectionsData.progress || 0);
          } else {
            setSections([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          Swal.fire({
            title: "خطأ في تحميل البيانات",
            text: "فشل في تحميل تفاصيل الدورة. يرجى المحاولة لاحقاً.",
            icon: "error",
            confirmButtonText: "حسناً"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchCourseDetails();
    } else {
      Swal.fire({
        title: "خطأ في المعرّف",
        text: "معرف الدورة غير موجود أو غير صالح",
        icon: "error",
        confirmButtonText: "حسناً"
      }).then(() => {
        router.push("/courses");
      });
    }
  }, [courseId, router]);

  // Handle PDF download with enhanced error handling and authentication
  const handlePdfDownload = (pdfFile) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "You need to be logged in to open files.", "error");
      return;
    }

    const pdfUrl = `${API_BASE_URL}${UPLOADS_BASE_PATH}${pdfFile.filePath}`;

    // إضافة التوكن في الرابط إذا كان السيرفر يدعمه كـ Query Parameter (لو السيرفر لا يدعم Header في ملفات ثابتة)
    const fullUrl = `${pdfUrl}?token=${token}`;

    // فتح الملف مباشرة في تبويب جديد
    window.open(fullUrl, '_blank');
  };


  // Handle video selection and mark lecture as done
  const handleVideoSelect = async (lectureId, videoUrl) => {
    setSelectedVideoUrl(videoUrl);
    setShowQuiz(false);
    await markLectureAsDone(lectureId);
  };

  // Mark lecture as done
  const markLectureAsDone = async (lectureId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Error", "You need to be logged in to mark lectures as done.", "error");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Lectures/${lectureId}/markDone`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      

      const updatedSections = sections.map((section) => ({
        ...section,
        lectures: section.lectures.map((lecture) =>
          lecture.id === lectureId ? { ...lecture, completed: true } : lecture
        ),
      }));
      setSections(updatedSections);

      const sectionsResponse = await fetch(`${API_BASE_URL}/api/Sections/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!sectionsResponse.ok) {
        throw new Error("Failed to fetch updated sections");
      }

      const sectionsData = await sectionsResponse.json();
      setProgress(sectionsData.progress);
    } catch (error) {
      console.error("Error marking lecture as done:", error);
    }
  };

  // Handle quiz selection
  const handleQuizSelect = (quizzes) => {
    setSelectedQuiz(quizzes);
    setShowQuiz(true);
    setUserAnswers({});
    setShowResults(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  // Handle quiz submission
  const handleSubmitAnswers = () => {
    if (!selectedQuiz) return;

    let correctAnswers = 0;
    selectedQuiz.forEach((quiz) => {
      if (userAnswers[quiz.id] === quiz.answer) {
        correctAnswers++;
      }
    });

    Swal.fire({
      icon: "success",
      title: "Quiz Results",
      text: `You answered ${correctAnswers} out of ${selectedQuiz.length} questions correctly!`,
    });

    setShowResults(true);
  };

  // Redirect to login page
  const handleLogin = () => {
    router.push("/login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return <div className={styles.errorContainer}>Course not found.</div>;
  }

  // Check if the user is authenticated
  const token = localStorage.getItem("token");

  return (
    <div className={styles.video}>
      {!token ? (
        <div className={styles.loginMessage}>
          <p>You need to be logged in to access the course materials.</p>
          <button className={styles.btn} onClick={handleLogin}>
            Login
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.container}>
            <div className={styles.moduleList}>
              <div className={styles.header}>
                <h2>Overall Progress: {progress}%</h2>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              {sections.length === 0 ? (
                <p>No sections available for this course.</p>
              ) : (
                sections.map((section, index) => (
                  <div key={index} className={styles.sectionItem}>
                    <hr />
                    <div className={styles.lectures}>
                      <h3>{section.sectionName}</h3>
                      <ul className={styles.lectureList}>
                        {section.lectures.map((lecture, idx) => (
                          <li
                            onClick={() => handleVideoSelect(lecture.id, lecture.url)}
                            key={idx}
                            className={lecture.completed ? styles.completedLecture : ''}
                          >
                            <span className={styles.icon}>
                              <FontAwesomeIcon icon={faCirclePlay} />
                            </span>
                            <strong>{lecture.title}</strong>
                            {lecture.completed && <span className={styles.completedBadge}>Completed</span>}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* PDF Files Section */}
                    {section.pdfFiles && section.pdfFiles.length > 0 && (
                      <div className={styles.pdfFiles}>
                        <h4>PDF Materials:</h4>
                        <ul>
                          {section.pdfFiles.map((pdf, idx) => (
                            <li
                              key={idx}
                              onClick={() => handlePdfDownload(pdf)}
                              title="Click to download"
                              className={styles.pdfItem}
                            >
                              <span className={styles.icon}>
                                <FontAwesomeIcon icon={faFilePdf} />
                              </span>
                              <span className={styles.fileName}>{pdf.fileName}</span>
                              
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quizzes Section */}
                    {section.quizzes && section.quizzes.length > 0 && (
                      <div className={styles.quizzes}>
                        <h4>Quizzes:</h4>
                        <ul>
                          <li>
                            <button
                              className={styles.selectButton}
                              onClick={() => handleQuizSelect(section.quizzes)}
                            >
                              Take Quiz
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className={styles.videoPlayer}>
              {showQuiz ? (
                <div className={styles.quizContainer}>
                  <h2>Quiz Questions</h2>
                  <div className={styles.quizScroll}>
                    {selectedQuiz.map((quiz, index) => (
                      <div key={quiz.id} className={styles.quizItem}>
                        <h3>Question {index + 1}: {quiz.question}</h3>
                        <ul>
                          {[
                            quiz.firstOption,
                            quiz.secondOption,
                            quiz.thirdOption,
                            quiz.fourthOption,
                          ].map((option, idx) => (
                            <li key={idx}>
                              <button
                                className={`${styles.quizOption} ${userAnswers[quiz.id] === option ? styles.selected : ""
                                  } ${showResults && option === quiz.answer ? styles.correctAnswer : ""
                                  }`}
                                onClick={() => handleAnswerSelect(quiz.id, option)}
                                disabled={showResults}
                              >
                                {option}
                              </button>
                            </li>
                          ))}
                        </ul>
                        {showResults && (
                          <p className={styles.answer}>
                            Correct answer: {quiz.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    className={styles.submitButton}
                    onClick={handleSubmitAnswers}
                    disabled={showResults || Object.keys(userAnswers).length !== selectedQuiz.length}
                  >
                    Submit Answers
                  </button>
                </div>
              ) : selectedVideoUrl ? (
                <iframe
                  className={styles.iframe}
                  width="100%"
                  height="500"
                  src={selectedVideoUrl}
                  title="Course Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className={styles.videoPlaceholder}>
                  <img src="/images.jpg" alt="Learning Course" />
                  <div className={styles.playButton}>
                    <FontAwesomeIcon icon={faPlay} />
                  </div>
                  <p>Select a lecture to start watching</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;