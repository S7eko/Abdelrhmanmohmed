"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay, faPlay, faFilePdf, faDownload, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import ReactPlayer from 'react-player';
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
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [progress, setProgress] = useState(0);

  // Constants
  const API_BASE_URL = "https://skillbridge.runasp.net";
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

          // Check authentication
          const token = localStorage.getItem("token");
          if (!token) {
            Swal.fire({
              title: "Authentication Error",
              text: "You need to login to access course content",
              icon: "error",
              confirmButtonText: "OK"
            });
            setIsLoading(false);
            return;
          }

          // Fetch sections with progress
          const sectionsResponse = await fetch(`${API_BASE_URL}/api/Sections/${courseId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!sectionsResponse.ok) {
            throw new Error("Failed to fetch sections");
          }

          const sectionsData = await sectionsResponse.json();

          // Update progress state
          if (sectionsData.progress !== undefined) {
            setProgress(sectionsData.progress);
          }

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
          } else {
            setSections([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          Swal.fire({
            title: "Data Loading Error",
            text: "Failed to load course details. Please try again later.",
            icon: "error",
            confirmButtonText: "OK"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchCourseDetails();
    } else {
      Swal.fire({
        title: "ID Error",
        text: "Course ID is missing or invalid",
        icon: "error",
        confirmButtonText: "OK"
      }).then(() => {
        router.push("/courses");
      });
    }
  }, [courseId, router]);

  // Handle PDF download
  const handlePdfDownload = (pdfFile) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "You need to be logged in to open files.", "error");
      return;
    }

    const pdfUrl = `${API_BASE_URL}${UPLOADS_BASE_PATH}${pdfFile.filePath}`;
    const fullUrl = `${pdfUrl}?token=${token}`;
    window.open(fullUrl, '_blank');
  };

  // Handle video selection
  const handleVideoSelect = async (lectureId, videoUrl) => {
    try {
      setHasVideoError(false);
      let validUrl = videoUrl;

      if (!videoUrl.startsWith('http')) {
        validUrl = `https://${videoUrl}`;
      }

      try {
        const testResponse = await fetch(validUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error('Video URL not accessible');
        }
      } catch (testError) {
        console.warn('HEAD request failed, trying to proceed anyway:', testError);
      }

      setSelectedVideoUrl(validUrl);
      setShowQuiz(false);
      await markLectureAsDone(lectureId);
    } catch (error) {
      console.error('Video playback error:', error);
      setHasVideoError(true);
      Swal.fire({
        title: "Video Playback Error",
        text: "Failed to load video. Please check the URL or try again later.",
        icon: "error"
      });
    }
  };

  // Mark lecture as done
  const markLectureAsDone = async (lectureId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Error", "You need to be logged in to mark lectures as done.", "error");
        return;
      }

      await fetch(`${API_BASE_URL}/api/Lectures/${lectureId}/markDone`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch updated sections and progress from backend
      const sectionsResponse = await fetch(`${API_BASE_URL}/api/Sections/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!sectionsResponse.ok) {
        throw new Error("Failed to fetch updated sections");
      }

      const sectionsData = await sectionsResponse.json();

      // Update progress state
      if (sectionsData.progress !== undefined) {
        setProgress(sectionsData.progress);

        // Show completion message if progress reaches 100%
        if (sectionsData.progress === 100) {
          Swal.fire({
            title: "Congratulations!",
            text: "You've completed this course!",
            icon: "success"
          });
        }
      }

      if (sectionsData.sections && Array.isArray(sectionsData.sections)) {
        const updatedSections = sectionsData.sections.map((section) => ({
          ...section,
          lectures: section.lectures?.map((lecture) => ({
            ...lecture,
            completed: lecture.id === lectureId ? true : localStorage.getItem(`lecture-${lecture.id}-completed`) === "true",
          })) || [],
          pdfFiles: section.pdfFiles || [],
          quizzes: section.quizzes || []
        }));

        setSections(updatedSections);
      }
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
    setSelectedVideoUrl("");
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  // Handle quiz submission
  const handleSubmitAnswers = async () => {
    if (!selectedQuiz) return;

    let correctAnswers = 0;
    selectedQuiz.forEach((quiz) => {
      if (userAnswers[quiz.id] === quiz.answer) {
        correctAnswers++;
      }
    });

    const resultMessage = `You answered ${correctAnswers} out of ${selectedQuiz.length} questions correctly!`;

    Swal.fire({
      icon: "success",
      title: "Quiz Results",
      text: resultMessage,
    });

    setShowResults(true);

    // Mark quiz as completed if all answers are correct
    if (correctAnswers === selectedQuiz.length) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch updated progress after quiz completion
        const sectionsResponse = await fetch(`${API_BASE_URL}/api/Sections/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          if (sectionsData.progress !== undefined) {
            setProgress(sectionsData.progress);
          }
        }
      } catch (error) {
        console.error("Error updating progress after quiz:", error);
      }
    }
  };

  // Redirect to login
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

  // Check authentication
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
          {/* Progress Bar Section */}
          
            

            <div className={styles.container}>
              
              <div className={styles.moduleList}>
                <div className={styles.progressSection}>
                  <div className={styles.progressContainer}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>{progress}% Complete</span>
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
                            {lecture.completed && (
                              <span className={styles.completedBadge}>
                                <FontAwesomeIcon icon={faCheckCircle} /> Completed
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

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
              ) : selectedVideoUrl && !hasVideoError ? (
                <div className={styles.videoWrapper}>
                  <ReactPlayer
                    url={selectedVideoUrl}
                    width="100%"
                    height="500px"
                    controls={true}
                    onError={(e) => {
                      console.error("Error playing video:", e);
                      setHasVideoError(true);
                      Swal.fire({
                        title: "Video Playback Error",
                        text: "Failed to load video. Please check the URL or try again later.",
                        icon: "error"
                      });
                    }}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                  />
                </div>
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