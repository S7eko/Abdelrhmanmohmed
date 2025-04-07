import React from "react";
import Image from "next/image";
import classes from "../style/recommendations.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faClock, faCirclePlay, faUser } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Recommendations = () => {
  const recommendations = [
    {
      id: 1,
      title: "Web Programming Basics",
      text: "Learning Material on Beginner Website Development",
      star: "4.0",
      hour: "4.5",
      video: "20",
      user: "1.900",
      image: "/web.svg",
    },
    {
      id: 2,
      title: "Digital Marketing 101",
      text: "Material on Beginner Marketing Strategies and Concepts",
      star: "4.9",
      hour: "6.2",
      video: "32",
      user: "930",
      image: "/digital.svg",
    },
    {
      id: 3,
      title: "Basic Data Science",
      text: "Learning Material on the Fundamentals of Data Science",
      star: "4.9",
      hour: "8",
      video: "46",
      user: "1.043",
      image: "/datasince.svg",
    },
  ];

  return (
    <div className={classes.recommendations}>
      <div className={classes.recommendations_header}>
        <h2>Course Recommendations for You</h2>
        <Link href="/course/allcourse" className={classes.btn}>
          View All
        </Link>
      </div>
      <hr />
      <div className={classes.recommendations_Card}>
        {recommendations.map((item) => (
          <div key={item.id} className={classes.recommendations_Card_item}>
            <div className={classes.recommendations_Card_item_image}>
              <Image src={item.image} alt={item.title} loading="lazy" width={380} height={230} />
              <div className={classes.recommendations_Card_item_star}>
                <a className={classes.star} href="">
                  <FontAwesomeIcon color="#FCD980" icon={faStar} width={15} height={15} /> {item.star}
                </a>
              </div>
            </div>
            <div className={classes.recommendations_Card_item_text}>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <div className={classes.recommendations_Card_item_text_icon}>
                <a href="">
                  <FontAwesomeIcon icon={faClock} width={20} height={20} /> {item.hour} HOURS
                </a>
                <a href="">
                  <FontAwesomeIcon icon={faCirclePlay} width={20} height={20} /> {item.video} Video
                </a>
                <a href="">
                  <FontAwesomeIcon icon={faUser} width={20} height={20} /> {item.user} Students
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
