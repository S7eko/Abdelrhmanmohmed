import React from "react";
import classes from "../style/benefits.module.css";

const Benefits = () => {
  const benefits = [
    {
      id: 1,
      number: "1",
      title: "Free Courses",
      text: "We offer a range of free courses to promote access to education for underserved communities.",
    },
    {
      id: 2,
      number: "2",
      title: "Lifetime Access Guaranteed",
      text: "All the courses you've enrolled in are available to you forever, giving you the freedom to learn at your own pace without any pressure.",
    },
    {
      id: 3,
      number: "3",
      title: "Consultation Services",
      text: "Join the consultation group to ask any questions you have, or start a new discussion to engage with others and get helpful insights.",
    },
    {
      id: 4,
      number: "4",
      title: "Certificate and Portfolio",
      text: "After completing a course, you will receive a certificate and a portfolio showcasing the projects you've completed throughout the course.",
    },
    {
      id: 5,
      number: "5",
      title: "More Structured Learning",
      text: "The courses range from basic to expert levels, allowing everyone to learn with the services we provide.",
    },
    {
      id: 6,
      number: "6",
      title: "Experienced Instructors",
      text: "We have experienced instructors from the industry, whose expertise is unquestionable.",
    },
  ];

  return (
    <div className={classes.benefits}>
      {/* Header Section */}
      <div className={classes.benefits_Text}>
        <h2>Benefits of Joining Obour Academy Online E-Learning</h2>
      </div>

      {/* Benefits Cards Section */}
      <div className={classes.benefits_Cards}>
        {benefits.map((benefit) => (
          <div key={benefit.id} className={classes.Card}>
            {/* Number Section */}
            <div className={classes.Card_bule}>
              <p>{benefit.number}</p>
              <div className={classes.Card_yallow}></div>
            </div>
            {/* Text Section */}
            <div className={classes.Card_text}>
              <h4>{benefit.title}</h4>
              <p>{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Benefits;
