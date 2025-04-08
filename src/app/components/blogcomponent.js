"use client";
import React, { useState } from 'react';
import styles from '../style/BlogComponents.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBookmark,
  faShareAlt,
  faCommentAlt,
  faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import {
  faThumbsUp as farThumbsUp
} from '@fortawesome/free-regular-svg-icons';

const BlogComponent = () => {
  // حالة البحث
  const [searchQuery, setSearchQuery] = useState('');

  // حالة المقالات المفضلة
  const [savedArticles, setSavedArticles] = useState([]);

  // حالة الإعجابات
  const [likedArticles, setLikedArticles] = useState([]);

  // بيانات المقالات (صور احترافية مع عناوين جذابة)
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: "أحدث اتجاهات تطوير الويب في 2023: ما تحتاج لمعرفته",
      excerpt: "استكشف أحدث التقنيات والأدوات التي ستغير وجه تطوير الويب هذا العام وكيفية الاستعداد لها.",
      author: "د. أحمد عبد الرحمن",
      date: "20 مايو 2023",
      readTime: "7 دقائق",
      category: "تطوير الويب",
      likes: 245,
      comments: 42,
      image: "/about.svg"
    },
    {
      id: 2,
      title: "دليل المبتدئين الشامل لتعلم بايثون في 30 يومًا",
      excerpt: "خطة عملية يومية لإتقان أساسيات بايثون وتطوير أول مشروع حقيقي خلال شهر واحد فقط.",
      author: "أ. سارة الكمالي",
      date: "12 أبريل 2023",
      readTime: "10 دقائق",
      category: "تعلم البرمجة",
      likes: 189,
      comments: 35,
      image: "/about.svg"
    },
    {
      id: 3,
      title: "كيفية بناء مشروع تعلم آلي ناجح من الصفر",
      excerpt: "دليل عملي يشرح خطوة بخطوة كيفية تطوير نموذج تعلم آلي فعال وحل مشاكل حقيقية.",
      author: "د. محمد سمير",
      date: "3 مارس 2023",
      readTime: "12 دقائق",
      category: "الذكاء الاصطناعي",
      likes: 312,
      comments: 58,
      image: "/about.svg"
    },
    {
      id: 4,
      title: "أفضل 10 أدوات لتطوير تطبيقات الجوال في 2023",
      excerpt: "مقارنة شاملة بين أحدث أطر عمل تطوير التطبيقات ومميزات كل منها.",
      author: "م. خالد إبراهيم",
      date: "28 فبراير 2023",
      readTime: "8 دقائق",
      category: "تطوير التطبيقات",
      likes: 178,
      comments: 29,
      image: "/about.svg"
    },
    {
      id: 5,
      title: "استراتيجيات التعلم الفعال: كيف تتعلم أي شيء بسرعة",
      excerpt: "أساليب علمية مثبتة لتعزيز قدرتك على التعلم وإتقان المهارات التقنية.",
      author: "د. ليلى مصطفى",
      date: "15 فبراير 2023",
      readTime: "9 دقائق",
      category: "نصائح تعليمية",
      likes: 201,
      comments: 47,
      image: "/about.svg"
    },
    {
      id: 6,
      title: "أساسيات أمن المعلومات لكل مطور ويب",
      excerpt: "أفضل الممارسات الأمنية التي يجب على كل مطور ويب تطبيقها لحماية التطبيقات.",
      author: "م. أمين سليمان",
      date: "5 فبراير 2023",
      readTime: "11 دقائق",
      category: "أمن المعلومات",
      likes: 156,
      comments: 23,
      image: "/about.svg"
    },
    {
      id: 7,
      title: "كيفية تحسين أداء تطبيقات React بشكل كبير",
      excerpt: "تقنيات متقدمة لتحسين سرعة وأداء تطبيقات React مع أمثلة عملية.",
      author: "أ. ياسمين علي",
      date: "22 يناير 2023",
      readTime: "8 دقائق",
      category: "تطوير الويب",
      likes: 198,
      comments: 31,
      image: "/about.svg"
    },
    {
      id: 8,
      title: "مقدمة إلى تحليل البيانات باستخدام Python وPandas",
      excerpt: "كيفية استخدام Pandas لتحليل ومعالجة البيانات باحترافية مع أمثلة واقعية.",
      author: "د. وائل كمال",
      date: "10 يناير 2023",
      readTime: "10 دقائق",
      category: "علم البيانات",
      likes: 167,
      comments: 27,
      image: "/about.svg"
    }
  ]);

  // تصفية المقالات حسب البحث
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // حفظ/إزالة المقال من المفضلة
  const toggleSaveArticle = (articleId) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles(savedArticles.filter(id => id !== articleId));
    } else {
      setSavedArticles([...savedArticles, articleId]);
    }
  };

  // إعجاب/عدم إعجاب بالمقال
  const toggleLikeArticle = (articleId) => {
    const articleIndex = articles.findIndex(article => article.id === articleId);
    const updatedArticles = [...articles];

    if (likedArticles.includes(articleId)) {
      setLikedArticles(likedArticles.filter(id => id !== articleId));
      updatedArticles[articleIndex].likes -= 1;
    } else {
      setLikedArticles([...likedArticles, articleId]);
      updatedArticles[articleIndex].likes += 1;
    }

    setArticles(updatedArticles);
  };

  // مشاركة المقال
  const shareArticle = (title, url) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.origin + url
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareUrl = window.location.origin + url;
      prompt("انسخ الرابط لمشاركة المقال:", shareUrl);
    }
  };

  // فئات المدونة
  const categories = [
    "الكل",
    "تطوير الويب",
    "تعلم البرمجة",
    "الذكاء الاصطناعي",
    "تطوير التطبيقات",
    "أمن المعلومات",
    "علم البيانات",
    "نصائح تعليمية"
  ];

  // الفئة المحددة
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // تصفية المقالات حسب الفئة
  const categoryFilteredArticles = selectedCategory === "الكل"
    ? filteredArticles
    : filteredArticles.filter(article => article.category === selectedCategory);

  return (
    <div className={styles.blogContainer}>
      {/* شريط البحث والفلاتر */}
      <div className={styles.blogHeader}>
        <h1>مدونة التعلم المتقدم</h1>
        <p>مصدرك الشامل لأحدث المقالات التقنية والتعليمية</p>

        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="ابحث عن مقالات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.categories}>
          {categories.map((category, index) => (
            <button
              key={index}
              className={selectedCategory === category ? styles.active : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة المقالات */}
      <div className={styles.articlesGrid}>
        {categoryFilteredArticles.map(article => (
          <div key={article.id} className={styles.articleCard}>
            <div className={styles.articleImage}>
              <img
                src={article.image}
                alt={article.title}
                onError={(e) => {
                  e.target.src = '/blog/default-article.jpg';
                }}
              />
              <span className={styles.categoryTag}>{article.category}</span>
            </div>

            <div className={styles.articleContent}>
              <h3>{article.title}</h3>
              <p className={styles.excerpt}>{article.excerpt}</p>

              <div className={styles.metaInfo}>
                <span className={styles.author}>بواسطة {article.author}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.date}>{article.date}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.readTime}>{article.readTime} قراءة</span>
              </div>

              <div className={styles.articleActions}>
                <button
                  onClick={() => toggleLikeArticle(article.id)}
                  className={styles.likeButton}
                  aria-label="إعجاب"
                >
                  <FontAwesomeIcon
                    icon={likedArticles.includes(article.id) ? faThumbsUp : farThumbsUp}
                    className={likedArticles.includes(article.id) ? styles.liked : ''}
                  />
                  <span>{article.likes}</span>
                </button>

                <button
                  className={styles.commentButton}
                  aria-label="تعليقات"
                >
                  <FontAwesomeIcon icon={faCommentAlt} />
                  <span>{article.comments}</span>
                </button>

                <button
                  onClick={() => toggleSaveArticle(article.id)}
                  className={styles.saveButton}
                  aria-label="حفظ"
                >
                  <FontAwesomeIcon
                    icon={faBookmark}
                    className={savedArticles.includes(article.id) ? styles.saved : ''}
                  />
                </button>

                <button
                  onClick={() => shareArticle(article.title, `/blog/${article.id}`)}
                  className={styles.shareButton}
                  aria-label="مشاركة"
                >
                  <FontAwesomeIcon icon={faShareAlt} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* زر تحميل المزيد */}
      {categoryFilteredArticles.length > 0 && (
        <div className={styles.loadMore}>
          <button>عرض المزيد من المقالات</button>
        </div>
      )}

      {/* حالة عدم وجود مقالات */}
      {categoryFilteredArticles.length === 0 && (
        <div className={styles.noResults}>
          <img src="/blog/no-results.svg" alt="لا توجد نتائج" />
          <h3>لا توجد مقالات متطابقة مع بحثك</h3>
          <p>حاول استخدام مصطلحات بحث مختلفة أو تصفح الفئات الأخرى</p>
        </div>
      )}
    </div>
  );
};

export default BlogComponent;