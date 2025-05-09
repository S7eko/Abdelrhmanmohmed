"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import classes from "../style/recommendations.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faClock, faCirclePlay, faUser } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Loader from "./Loader";
import Container from "./container";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `https://skillbridge.runasp.net/api/courses?pageIndex=1&pageSize=3`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        if (data && data.data) {
          setRecommendations(data.data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // عرض أول 3 كورسات فقط ما لم يتم الضغط على View All
  const displayedCourses = showAll ? recommendations : recommendations.slice(0, 3);

  return (
    <Container>
      <div className={classes.recommendations}>
        <div className={classes.recommendations_header}>
          <h2>Course Recommendations for You</h2>
          <Link href="/course/allcourse" className={classes.btn}>
            View All
          </Link>
        </div>
        <hr />
        <div className={classes.recommendations_Card}>
          {isLoading ? (
          <div className="spinner"><Loader /></div>
        ) : error ? (
          <p>Error: {error}</p>
        ) : displayedCourses.length > 0 ? (
          displayedCourses.map((item) => (
            <div key={item.id} className={classes.recommendations_Card_item}>
              <div className={classes.recommendations_Card_item_image}>
                <Image
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  width={380}
                  height={230}
                />
                <div className={classes.recommendations_Card_item_star}>
                  <a className={classes.star} href="">
                    <FontAwesomeIcon color="#FCD980" icon={faStar} width={15} height={15} />{" "}
                    {item.rating}
                  </a>
                </div>
              </div>
              <div className={classes.recommendations_Card_item_text}>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <div className={classes.recommendations_Card_item_text_icon}>
                  <a href="">
                    <FontAwesomeIcon icon={faClock} width={20} height={20} /> {item.level}
                  </a>
                  <a href="">
                    <FontAwesomeIcon icon={faCirclePlay} width={20} height={20} /> {item.language}
                  </a>
                  <a href="">
                    <FontAwesomeIcon icon={faUser} width={20} height={20} /> {item.students} Students
                  </a>
                </div>
                <div className={classes.recommendations_Card_item_price}>
                  <p>Instructor: {item.instructor}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No recommendations found</p>
        )}
      </div>
      </div>
    </Container>
  );
};

export default Recommendations;