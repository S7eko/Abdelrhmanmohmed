import React from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faUserGraduate, faChalkboardTeacher, faCertificate, faHeadset, faStar, faUsers } from "@fortawesome/free-solid-svg-icons";
import classes from "../style/about.module.css";

const About = () => {
  return (
    <div className={classes.aboutContainer}>
      <div className={classes.aboutContent}>
        <h1>من نحن</h1>
        <p>
          مرحبًا بك في **منصتنا التعليمية**، وهي منصة تم تطويرها كجزء من مشروع تخرج يهدف إلى توفير تجربة تعليمية بسيطة وفعّالة للطلاب والمهتمين بالتعلم الذاتي.
        </p>

        <div className={classes.features}>
          <div className={classes.feature}>
            <FontAwesomeIcon icon={faBook} width={100} height={100} className={classes.icon} />
            <h3>مواد تعليمية</h3>
            <p>نوفر مجموعة من المواد التعليمية في مجالات مختلفة لدعم تعلمك.</p>
            <button className={classes.learnMoreBtn}>استكشاف المواد</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faUserGraduate} width={100} height={100} className={classes.icon} />
            <h3>تعلّم مرن</h3>
            <p>يمكنك الوصول إلى المحتوى التعليمي في أي وقت يناسبك.</p>
            <button className={classes.learnMoreBtn}>ابدأ الآن</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faChalkboardTeacher} width={100} height={100} className={classes.icon} />
            <h3>دروس مبسطة</h3>
            <p>دروس مصممة بعناية لتكون سهلة الفهم ومباشرة.</p>
            <button className={classes.learnMoreBtn}>تعرف على الدروس</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faCertificate} width={100} height={100} className={classes.icon} />
            <h3>شهادات مشاركة</h3>
            <p>احصل على شهادة مشاركة بعد إكمالك للمواد التعليمية.</p>
            <button className={classes.learnMoreBtn}>اطلع على الشهادات</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faHeadset} width={100} height={100} className={classes.icon} />
            <h3>دعم فني</h3>
            <p>فريق الدعم متاح لمساعدتك في حال واجهتك أي مشكلة.</p>
            <button className={classes.learnMoreBtn}>تواصل معنا</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faUsers} width={100} height={100} className={classes.icon} />
            <h3>مجتمع تفاعلي</h3>
            <p>تفاعل مع زملائك من خلال منتديات النقاش البسيطة.</p>
            <button className={classes.learnMoreBtn}>انضم إلى المجتمع</button>
          </div>

          <div className={classes.feature}>
            <FontAwesomeIcon icon={faStar} width={100} height={100} className={classes.icon} />
            <h3>تقييمات المستخدمين</h3>
            <p>شاركنا رأيك لمساعدتنا على تحسين المنصة.</p>
            <button className={classes.learnMoreBtn}>شارك رأيك</button>
          </div>
        </div>

        <div className={classes.callToAction}>
          <h2>ابدأ رحلتك التعليمية معنا!</h2>
          <p>انضم إلى منصتنا واستفد من المواد التعليمية المتاحة.</p>
          <Link href="/course/allcourse">
            <button className={classes.joinNowBtn}>انضم إلينا الآن</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;