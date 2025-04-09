import React from "react";
import classes from "../style/header.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Main = () => {
  return (
    <div className={classes.main_container}>
      <div className={classes.main}>
        <div className={classes.main_left_text}>
          <h2>
            Build and Achieve Dreams <br />
            Together
          </h2>
          <p>
            EDUFREE is a free online course and training service designed to help
            <span>you achieve your dreams in the field of technology.</span>
          </p>
          <div className={classes.main_left_text_button}>
            <Link href="/course/signUp" className={classes.btn}>Get Started</Link>
            <Link href="/course/allcourse" className={classes.Link}>
              View Learning Path
              <FontAwesomeIcon className={classes.icon} icon={faArrowRight} />
            </Link>
          </div>
        </div>
        <div className={classes.main_right}>
          <div className={classes.main_right_image}>
            <Image
              src="main.svg"
              alt="Description of the image"
              loading="lazy"
              className={classes.img}
              width={577}
              height={370}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
