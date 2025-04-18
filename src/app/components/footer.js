import React from 'react';
import classes from '../style/footer.module.css'

const Footer = () => {
  return (
    <div className={classes.container}>
      <div className={classes.footer}>
        <div className={classes.Top_footer}>
          <div className={classes.Top_footer_left}>
            <h1>SkillVerse</h1>
            <p>Build and realize your dreams together.</p>
          </div>
          <div className={classes.Top_footer_right}>
            <div className={classes.Top_footer_right_linkes}>
              <h3>Sosial Media</h3>
              <p>Facebook</p>
              <p>Twitter</p>
              <p>Instagram</p>
            </div>
            <div className={classes.Top_footer_right_linkes}>
              <h3>Program</h3>
              <p>Web Development</p>
              <p>Mobile Development</p>
            </div>
            <div className={classes.Top_footer_right_linkes}>
              <h3>Support</h3>
              <p>Help Center</p>
              <p>Terms and Conditions</p>
              <p>Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default Footer
