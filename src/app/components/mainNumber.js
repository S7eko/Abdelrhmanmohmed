"use client";
import React, { useEffect, useState } from 'react';
import classes from '../style/mainNumber.module.css';

const MainNumber = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0, // Fixing the typo from "totalStudetns" to "totalStudents"
    popularCourses: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://skillbridge.runasp.net/api/Stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats({
          totalCourses: data.totalCourses,
          totalStudents: data.totalStudetns, // Be aware that the API response has a typo
          popularCourses: data.popularCourses,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={classes.main_number}>
      <div className={classes.number}>
        <div className={classes.number1}>
          <h2>{stats.totalStudents}+</h2>
          <p>Registered Students</p>
        </div>
        <div className={classes.number2}>
          <h2>{stats.popularCourses.length}+</h2> {/* Keeping static for now since the API doesn't return instructors */}
          <p>Popular Courses</p>
        </div>
        <div className={classes.number3}>
          <h2>{stats.totalCourses}+</h2>
          <p>Free Courses</p>
        </div>
       
      </div>
    </div>
  );
};

export default MainNumber;
