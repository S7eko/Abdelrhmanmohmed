import React from "react";
import classes from "../style/container.module.css";

const Container = ({ children }) => {

  return (
    <div className={classes.container}>
      {children} {/* يتم عرض الأطفال هنا */}
    </div>
  );
};

export default Container;
