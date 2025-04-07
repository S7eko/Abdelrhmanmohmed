"use client";
import React, { useState } from "react";
import classes from "../style/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Reusable Input Field Component
const InputField = ({ type, id, placeholder, value, onChange }) => {
  return (
    <div className={classes.form_group}>
      <input type={type} id={id} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
};

const Login = () => {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://skillbridge.runasp.net/api/Users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json(); // Parse response even on error

      if (!response.ok) {
        setError(result.message || "Login failed. Please try again.");
        return;
      }

      setSuccess("خش يا بطل كمل واثبت نفسك");
      console.log("Login successful:", result);

      // هنا يمكنك تخزين التوكن وإعادة توجيه المستخدم
      localStorage.setItem("token", result.token);
      setTimeout(() => {
        window.location.href = "/"; // استبدلها بالمسار المناسب
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  const content = {
    h3: "Homepage",
    h1: "One Step Closer to Your Dream",
    p: "A free E-Learning service ready to help you become an expert.",
    button: "Sign In",
    span: "Don't have an account?",
    a: "Sign Up",
  };

  return (
    <div className={classes.login}>
      <div className={classes.login_content}>
        {/* Header */}
        <header className={classes.login_header}>
          <h3>
            <FontAwesomeIcon icon={faArrowLeft} width={20} height={20} /> {content.h3}
          </h3>
        </header>

        {/* Body */}
        <div className={classes.login_body}>
          {/* Left Side */}
          <section className={classes.login_body_left}>
            <div className={classes.login_body_left_image}>
              <h1>{content.h1}</h1>
              <p>{content.p}</p>
            </div>
          </section>

          {/* Right Side */}
          <section className={classes.login_body_right}>
            <div className={classes.login_body_right_text}>
              <h1>Login</h1>
              <p>Prepare yourself for a future full of stars.</p>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <InputField
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password Input */}
              <InputField
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Submit Button */}
              <div className={classes.form_group}>
                <button type="submit">{content.button}</button>
              </div>

              {/* Error Message */}
              {error && <p className={classes.error}>{error}</p>}

              {/* Success Message */}
              {success && <p className={classes.success}>{success}</p>}

              <span>
                {content.span} <Link href="/course/signUp">{content.a}</Link>
              </span>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
