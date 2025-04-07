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
      <input type={type} id={id} placeholder={placeholder} value={value} onChange={onChange} required />
    </div>
  );
};

const Register = () => {
  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    // Check if all fields are filled
    if (!name || !email || !password) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    // Validate password contains at least one uppercase letter and one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%&!*^])[A-Za-z\d@#$%&!*^]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل، ورمز خاص واحد (@, #, $, %, إلخ)، وأن تكون طولها 8 أحرف على الأقل."
      );
      return;
    }

    // Prepare data to be sent
    const userData = {
      email: email,
      password: password,
      userName: name,
      role: role
    };

    try {
      const response = await fetch("https://skillbridge.runasp.net/api/Users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      // تحقق من الرد الخام
      const rawResponse = await response.text();
      console.log("Raw Response:", rawResponse);

      // حاول تحويل الرد إلى JSON
      let result;
      try {
        result = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error("خطأ في تحويل الرد إلى JSON:", jsonError);
        setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
        return;
      }

      if (!response.ok) {
        // Handle API-specific errors
        if (result.errors) {
          // If the API returns multiple errors (e.g., validation errors)
          const errorMessages = Object.values(result.errors).join(", ");
          setError(errorMessages);
        } else {
          setError(result.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
        }
        return;
      }

      // If registration is successful
      console.log("تم التسجيل بنجاح:", result);
      setSuccess("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      // Handle network or other errors
      console.error("خطأ في التسجيل:", error);
      setError("حدث خطأ. يرجى المحاولة مرة أخرى لاحقًا.");
    }
  };

  const content = [
    {

      h3: "Homepage",
      h1: "One Step Closer to Your Dream",
      p: "A free E-Learning service ready to help you become an expert.",
      button: "Register",
      span: "Already have an account?",
      a: "Log In",
    },
  ];

  return (
    <div className={classes.login}>
      <div className={classes.login_content}>
        {/* Header */}
        <header className={classes.login_header}></header>

        {/* Body */}
        <div className={classes.login_body}>
          {/* Left Side */}
          <section className={classes.login_body_left}>
            <div className={classes.login_body_left_image}>
              <h1>{content[0].h1}</h1>
              <p>{content[0].p}</p>
            </div>
          </section>

          {/* Right Side */}
          <section className={classes.login_body_right}>
            <div className={classes.login_body_right_text}>
              <h1>تسجيل</h1>
              <p>استعد لمستقبل مليء بالنجوم.</p>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <InputField
                type="text"
                id="name"
                placeholder="الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* Email Input */}
              <InputField
                type="email"
                id="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password Input */}
              <InputField
                type="password"
                id="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Role Selection */}
              <div className={classes.select}>
                <div
                  className={`${classes.role} ${role === "student" ? classes.active : ""}`}
                  onClick={() => setRole("student")}
                >
                  <label htmlFor="student">طالب</label>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <div
                  className={`${classes.role} ${role === "instructor" ? classes.active : ""}`}
                  onClick={() => setRole("instructor")}
                >
                  <label htmlFor="instructor">مدرس</label>
                  <input
                    type="radio"
                    name="role"
                    value="instructor"
                    checked={role === "instructor"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className={classes.form_group}>
                <button type="submit">{content[0].button}</button>
              </div>

              {/* Error Message */}
              {error && <p className={classes.error}>{error}</p>}

              {/* Success Message */}
              {success && <p className={classes.success}>{success}</p>}

              <span>
                {content[0].span} <Link href="/course/login">{content[0].a}</Link>
              </span>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Register;