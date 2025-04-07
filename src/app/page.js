import Image from "next/image";
import styles from "./style/page.module.css";
import Main from "./components/main";
import MainNumber from "./components/mainNumber";
import Benefits from "./components/benefits";
import AboutUs from "./components/aboutUs";
import Recommendations from "./components/recommendations";
import Question from "./components/question";
import Login from "./components/login";
import Register from "./components/register";
import Blog from "./components/blog";

import Chatbot from "./components/chatGpt";

export default function Home() {
  return (
    <div className={styles.page}>
      <Main />
      <MainNumber />
      <Benefits />
      <AboutUs />
      <Recommendations />
      <Question />
      <Register />
      <Blog />
    </div>
  );
}
