import React from 'react';
import Container from './container';
import Image from 'next/image';
import classes from '../style/courseSucses.module.css';
const CourseSucses = () => {
  return (
    <Container>
      <div className={classes.sucses}>
        <Image
          src={"/web.svg"}
          title="web"
          alt="Description of the image"
          loading="lazy"
          width={400}
          height={310}
        />
        <h2>Congratulations! Your Course is Now Open</h2>
        <p>The course you selected is now available. Please click the button below.</p>
        <button className={classes.btn}>Open Course</button>
      </div>
    </Container>
  );
}

export default CourseSucses
