"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faAngleDown, faCirclePlay, faPlay } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // استيراد useRouter
import Swal from "sweetalert2";
import classes from "../style/learningRoom.module.css";

const Sheko = () => {
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id: courseId } = router.query; // الحصول على courseId من الرابط

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return; // إذا لم يتم تحميل courseId بعد، لا تفعل شيئًا

      try {
        // جلب بيانات الكورس
        const courseResponse = await fetch(`https://skillbridge.runasp.net/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course details");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Error", "You need to be logged in to access this course.", "error");
          setIsLoading(false);
          return;
        }

        // جلب الأقسام الخاصة بالكورس
        const sectionsResponse = await fetch(`https://skillbridge.runasp.net/api/Sections/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!sectionsResponse.ok) {
          throw new Error("Failed to fetch sections");
        }

        const sectionsData = await sectionsResponse.json();

        if (sectionsData.sections && Array.isArray(sectionsData.sections)) {
          setSections(sectionsData.sections);
        } else {
          setSections([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load course details. Please try again later.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]); // إعادة جلب البيانات عند تغيير courseId

  if (isLoading) {
    return <p>Loading course details...</p>;
  }

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <>
      <Head>
        <title>Learning Platform</title>
        <meta name="description" content="Learn web development with our interactive courses." />
      </Head>

      <div className={classes.page}>
        <section className={classes.sidepar}>
          <div className={classes.headSide}>
            <span>&#91;OAO&#93;</span>
          </div>

          <div className={classes.bodySide}>
            <h3>Statistics</h3>

            <div className={classes.progressContainer}>
              <span>20&#37;</span>
              <div className={classes.customProgress}>
                <div className={classes.customProgressFill}></div>
              </div>
              <span className={classes.progressText}>4 dari 20 video telah selesai</span>
            </div>

            <div className={classes.courseSections}>
              {sections.map((section, index) => (
                <div key={index} className={classes.section}>
                  <h3>{section.sectionName}</h3>
                  {section.lectures.map((lecture, idx) => (
                    <div key={idx} className={classes.lesson}>
                      <span className={classes.iconActive}>
                        <FontAwesomeIcon icon={faCirclePlay} />
                      </span>
                      <span>{lecture.title}</span>
                    </div>
                  ))}
                  {section.quizzes && section.quizzes.length > 0 && (
                    <div className={classes.lesson}>
                      <span className={classes.icon}>
                        <FontAwesomeIcon icon={faCirclePlay} />
                      </span>
                      <span>Quiz: {section.quizzes.length} questions</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={classes.content}>
          <div className={classes.headContent}>
            <a>
              <FontAwesomeIcon icon={faBars} />
            </a>
            <div className={classes.profile}>
              <Image
                src="/images/profile.jpg"
                alt="Profile Picture"
                width={40}
                height={40}
                className={classes.profileImage}
              />
              <div className={classes.name}>
                <p>Hi, Dimas</p>
                <span>Frontend developer</span>
              </div>
              <a href="">
                <FontAwesomeIcon icon={faAngleDown} />
              </a>
            </div>
          </div>

          <div className={classes.pageTitle}>
            <p>{course.title}</p>
            <h2>{course.description}</h2>
          </div>

          <div className={classes.videoContainer}>
            <Image
              src="/images/learning.jpg"
              alt="learning course"
              width={800}
              height={450}
              className={classes.learningImage}
            />
            <div className={classes.playBtn}>
              <FontAwesomeIcon icon={faPlay} />
            </div>
          </div>

          <div className={classes.buttons}>
            <button>Return</button>
            <button>Finish &amp; Continue</button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Sheko;