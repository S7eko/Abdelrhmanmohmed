import React from "react";
import classes from "../style/blog.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Container from "./container";
import Link from "next/link";

const Blog = () => {
  const blog = [
    {
      id: 1,
      img: "/startlearning.svg",
      date: "19 Jan 2022",
      title: "Tips for Creating a Business Landing Page ",
      text: "The Importance of a Website in Building Trust in Your Business, Creating...",
      link: "Read More",
    },
    {
      id: 2,
      img: "/loding.svg",
      date: "19 Jan 2022",
      title: "Tips for Creating a Business Landing Page ",
      text: "The Importance of a Website in Building Trust in Your Business, Creating...",
      link: "Read More",
    },
    {
      id: 3,
      img: "/wordpress.svg",
      date: "19 Jan 2022",
      title: "How to Install WordPress for Beginners ",
      text: "Creating a website today can be done without coding; now you can make it with...",
      link: "Read More",
    },
  ];

  return (
    
      <div className={classes.blog}>
        <div className={classes.blog_container}>
          <div className={classes.blog_header}>
            <h3>Blog, News, and Events</h3>
          <Link href="/course/blog">
              View All
              <FontAwesomeIcon className={classes.icon} icon={faArrowRight} width={20} height={20} />
            </Link>
        </div>
          <div className={classes.blog_content}>
            <div className={classes.blog_Card}>
              {blog.map((post) => (
                <div key={post.id} className={classes.blog_Card_content}>
                  <div className={classes.blog_Card_img}>
                    <Image src={post.img} loading="lazy" alt={post.title} width={405} height={285} />
                  </div>
                  <div className={classes.blog_Card_text}>
                    <h5>{post.date}</h5>
                    <h2>{post.title}</h2>
                    <p>{post.text}</p>
                    <a href="">
                      {post.link}
                      <FontAwesomeIcon className={classes.icon} icon={faArrowRight} width={20} height={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Blog;
