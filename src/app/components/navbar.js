"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from "../style/Navigation.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBook,
  faBell,
  faEnvelope,
  faCog,
  faUserEdit,
  faQuestionCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const router = useRouter();

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("https://skillbridge.runasp.net/api/Users/currentUser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("https://skillbridge.runasp.net/api/Notifications", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setNotifications((prev) => [...new Set([...prev, ...data])]);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  const markNotificationsAsRead = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch("https://skillbridge.runasp.net/api/Notifications/markRead", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications([]);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    await markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const toggleProfile = useCallback(() => setShowProfile((prev) => !prev), []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    window.location.href = "/";
  }, []);

  const menuItems = useMemo(
    () => [
      { text: "Edit profile", href: "/course/profile", icon: faUserEdit },
      { text: "Log out", icon: faSignOutAlt, onClick: handleLogout },
    ],
    [handleLogout]
  );

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.mar}>
      <div className={styles.nav_container}>
        <div className={styles.nav_left}>
          {/* إضافة اللوجو هنا */}
          <Image
            src="/logo.svg" // تأكد من وجود الملف في مجلد public
            alt="SkillVerse Logo"
            width={40}
            height={40}
            className={styles.logo}
          />
          <h2>
            <Link href="/">SkillVerse</Link>
          </h2>
        </div>
        <div className={styles.nav_right}>
          <div className={`${styles.nav_right_List} ${sidebarOpen ? styles.active : ""}`}>
            <ul>
              <li>
                <Link href="/">HOME</Link>
              </li>
              <li>
                <Link href="/course/about">ABOUT US</Link>
              </li>
              <li>
                <Link href="/course/allcourse">COURSES</Link>
              </li>
              <li>
                <Link href="/course/blog">BLOG</Link>
              </li>

              {/* إظهار Admin فقط للمسؤولين */}
              {user && user.role === 'Admin' && (
                <li>
                  <Link href="/course/Admin">ADMIN</Link>
                </li>
              )}

              {/* إظهار Dashboard للمدربين والمسؤولين */}
              {(user && (user.role === 'Instructor' )) && (
                <li>
                  <Link href="/course/dashboard">DASHBOARD</Link>
                </li>
              )}

              <li ref={notificationsRef}>
                <div className={styles.notificationsContainer} onClick={toggleNotifications}>
                  <FontAwesomeIcon icon={faBell} className={styles.notificationIcon} />
                  {unreadNotificationsCount > 0 && (
                    <span className={styles.notificationBadge}>{unreadNotificationsCount}</span>
                  )}
                  {showNotifications && (
                    <div className={styles.notificationsDropdown}>
                      {notifications.length === 0 ? (
                        <p>No new notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread
                              }`}
                          >
                            <p>{notification.message}</p>
                            <small>{new Date(notification.createdAt).toLocaleString()}</small>
                          </div>
                        ))
                      )}
                      <button
                        className={styles.markAllAsReadButton}
                        onClick={handleMarkAllAsRead}
                      >
                        Mark All as Read
                      </button>
                    </div>
                  )}
                </div>
              </li>
              <li ref={dropdownRef}>
                {user ? (
                  <div className={styles.userProfile} onClick={toggleProfile}>
                    <img
                      src={user.pictureUrl || "/user.svg"}
                      className={styles.userImage}
                      alt="User Profile"
                    />
                    <p className={styles.userName}>{user.userName}</p>
                    {showProfile && (
                      <div className={styles.dropdown}>
                        <div className={styles.profileHeader}>
                          <FontAwesomeIcon icon={faUser} size="2x" className={styles.icon} />
                          <div>
                            <h4>{user.userName}</h4>
                            <p>{user.email}</p>
                            <p className={styles.userRole}>{user.role}</p>
                          </div>
                        </div>
                        <ul className={styles.menuItems}>
                          {menuItems.map((item, index) => (
                            <li
                              key={index}
                              onClick={(e) => {
                                if (item.onClick) {
                                  e.preventDefault();
                                  item.onClick();
                                }
                              }}
                            >
                              <FontAwesomeIcon icon={item.icon} className={styles.menuIcon} />
                              {item.text === "Log out" ? (
                                <span>{item.text}</span>
                              ) : (
                                <Link href={item.href || `/${item.text.toLowerCase().replace(/\s+/g, "-")}`}>
                                  {item.text}
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/course/login">
                    <button className={styles.nav_right_login_button}>Login</button>
                  </Link>
                )}
              </li>
            </ul>
          </div>
          <button className={styles.hamburger} onClick={toggleSidebar}>
            &#9776;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;