import React from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faUserGraduate, faChalkboardTeacher, faCertificate, faHeadset, faStar, faUsers, faLanguage, faGlobe } from "@fortawesome/free-solid-svg-icons";
import classes from "../style/about.module.css";

const About = () => {
  return (
    <div className={classes.aboutContainer}>
      <div className={classes.aboutContent}>
        <h1>About Us</h1>
        <p>
          Welcome to <strong>Our Learning Platform</strong>, an educational platform developed as part of a graduation project aimed at providing a simple and effective learning experience for students and self-learners.
        </p>

        <div className={classes.features}>
          <div className={classes.feature}>
            <FontAwesomeIcon icon={faBook} width={100} height={100} className={classes.icon} />
            <h3>Educational Materials</h3>
            <p>We provide a collection of educational materials in various fields to support your learning.</p>
            <button className={classes.learnMoreBtn}>Explore Materials</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faUserGraduate} width={100} height={100} className={classes.icon} />
            <h3>Flexible Learning</h3>
            <p>Access educational content anytime that suits your schedule.</p>
            <button className={classes.learnMoreBtn}>Start Now</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faChalkboardTeacher} width={100} height={100} className={classes.icon} />
            <h3>Simplified Lessons</h3>
            <p>Carefully designed lessons that are easy to understand and straightforward.</p>
            <button className={classes.learnMoreBtn}>View Lessons</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faCertificate} width={100} height={100} className={classes.icon} />
            <h3>Participation Certificates</h3>
            <p>Receive a certificate of participation after completing educational materials.</p>
            <button className={classes.learnMoreBtn}>View Certificates</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faHeadset} width={100} height={100} className={classes.icon} />
            <h3>Technical Support</h3>
            <p>Our support team is available to help you with any issues you encounter.</p>
            <button className={classes.learnMoreBtn}>Contact Us</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faUsers} width={100} height={100} className={classes.icon} />
            <h3>Interactive Community</h3>
            <p>Engage with peers through simple discussion forums.</p>
            <button className={classes.learnMoreBtn}>Join Community</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faStar} width={100} height={100} className={classes.icon} />
            <h3>User Ratings</h3>
            <p>Share your feedback to help us improve the platform.</p>
            <button className={classes.learnMoreBtn}>Share Feedback</button>
          </div>

          {/* Added new features */}
          <div className={classes.feature}>
            <FontAwesomeIcon icon={faLanguage} width={100} height={100} className={classes.icon} />
            <h3>Multilingual Support</h3>
            <p>Access content in multiple languages for better understanding.</p>
            <button className={classes.learnMoreBtn}>View Languages</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faGlobe} width={100} height={100} className={classes.icon} />
            <h3>Global Access</h3>
            <p>Learn from anywhere in the world with our online platform.</p>
            <button className={classes.learnMoreBtn}>Discover More</button>
          </div>
        </div>

        <div className={classes.callToAction}>
          <h2>Start Your Learning Journey With Us!</h2>
          <p>Join our platform and benefit from the available educational materials.</p>
          <Link href="/course/allcourse">
            <button className={classes.joinNowBtn}>Join Us Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;