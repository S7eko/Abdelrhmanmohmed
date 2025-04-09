"use client";
import React, { useState } from "react";
import classes from "../style/question.module.css";
import Container from "./container";

const Question = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const questions = [
    {
      id: 1,
      title: "Is this course really free?",
      text: "The courses provided can be accessed for free to support educational needs.",
    },
    {
      id: 2,
      title: "What is the duration of the course?",
      text: "Each course typically lasts between 3 to 6 hours depending on the complexity.",
    },
    {
      id: 3,
      title: "Is there any certificate provided?",
      text: "Yes, upon completion of the course, a certificate will be provided.",
    },
    {
      id: 4,
      title: "Can I access the course anytime?",
      text: "Yes, the courses are available for you to access anytime.",
    },
    {
      id: 5,
      title: "How do I contact support?",
      text: "You can reach support at support@courses.com or call our help desk.",
    },
  ];

  const toggleAnswer = (id) => {
    if (openQuestion === id) {
      setOpenQuestion(null); // إذا كان السؤال مفتوحًا بالفعل، إغلاقه
    } else {
      setOpenQuestion(id); // فتح السؤال الجديد
    }
  };

  return (
    <Container>
      <div className={classes.question}>
        <div className={classes.question_left}>
          <h2>Frequently Asked Questions</h2>
          <p>If you have any questions or need assistance, feel free to reach out to us at support@courses.com.</p>
        </div>
        <div className={classes.question_right}>
          {questions.map((question) => (
            <div key={question.id}>
              <div className={classes.question_right_header} onClick={() => toggleAnswer(question.id)}>
                <h4>
                  {question.id < 10 ? `0${question.id}` : question.id}
                  <span>{question.title}</span>
                </h4>
                <h2 className={openQuestion === question.id ? classes.open : ""}>
                  {openQuestion === question.id ? "x" : "+"}
                </h2>
              </div>
              <div
                className={`${classes.question_right_body} ${
                  openQuestion === question.id ? classes.show : ""
                }`}
              >
                <p>{question.text}</p>
              </div>
              <hr className={classes.line} />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Question;
