import styles from "../style/loding.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
        <div className={styles.loaderDot}></div>
      </div>
      <p className={styles.loadingText}>جاري التحميل...</p>
    </div>
  );
};

export default Loader;