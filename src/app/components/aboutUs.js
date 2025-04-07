import React from 'react'
import classes from '../style/aboutUs.module.css'
import Image from 'next/image';
const AboutUs = () => {
  return (
    <div className={classes.about_us}>
      <div className={classes.about_us_content}>
        <div className={classes.about_us_text}>
          <h5>About Us</h5>
          <h1>SkillVerse: A Free E-Learning Service to Help You Grow</h1>
          <p>SkillVerse is expected to be a beneficial service for the future in the field of education.</p>
        </div>
        <div className={classes.about_us_image}>
          <Image src="about.svg" loading="lazy" alt="about" width={577} height={370} />
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
