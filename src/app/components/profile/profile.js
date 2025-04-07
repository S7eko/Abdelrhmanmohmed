"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBook,
  faShoppingCart,
  faHeart,
  faChalkboardTeacher,
  faBell,
  faEnvelope,
  faCog,
  faCreditCard,
  faHistory,
  faGlobe,
  faUserEdit,
  faQuestionCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import styles from "./profile.module.css";

export default function Profile() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { text: "My learning", icon: faBook },
    { text: "My cart", icon: faShoppingCart },
    { text: "Wishlist", icon: faHeart },
    { text: "Teach on CodePulse", icon: faChalkboardTeacher },
    { text: "Notifications", icon: faBell },
    { text: "Messages", icon: faEnvelope },
    { text: "Account settings", icon: faCog },
    { text: "Payment methods", icon: faCreditCard },
    { text: "Subscriptions", icon: faCreditCard },
    { text: "Purchase history", icon: faHistory },
    { text: "Language", icon: faGlobe },
    { text: "Public profile", icon: faUser },
    { text: "Edit profile", icon: faUserEdit },
    { text: "Help and Support", icon: faQuestionCircle },
    { text: "Log out", icon: faSignOutAlt },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className={styles.menuContainer} ref={dropdownRef}>
      <div className={styles.profile} onClick={() => setOpen(!open)}>
        <FontAwesomeIcon icon={faUser} size="2x" className={styles.icon} />
        <span>Abdel-Rhman</span>
      </div>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.profileHeader}>
            <FontAwesomeIcon icon={faUser} size="3x" className={styles.icon} />
            <div>
              <h4>Abdel-Rhman</h4>
              <p>abdelrhman.coding.developer@gmail.com</p>
            </div>
          </div>

          <ul className={styles.menuItems}>
            {menuItems.map((item, index) => (
              <li key={index} onClick={item.text === "Log out" ? handleLogout : null}>
                <FontAwesomeIcon icon={item.icon} className={styles.menuIcon} />
                {item.text === "Log out" ? (
                  <span>{item.text}</span>
                ) : (
                  <Link href={`/${item.text.toLowerCase().replace(/\s+/g, "-")}`}>{item.text}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}