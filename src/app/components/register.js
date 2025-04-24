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
    setError("");
    setSuccess("");

    // Validation
    if (!name || !email || !password || !role) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%&!*^])[A-Za-z\d@#$%&!*^]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل، وحرف خاص واحد (@, #, $, %, إلخ)، وأن تكون طولها 8 أحرف على الأقل."
      );
      return;
    }

    // Prepare data
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

      const rawResponse = await response.text();
      console.log("Raw Response:", rawResponse);

      let result;
      try {
        result = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error("خطأ في تحويل الرد إلى JSON:", jsonError);
        setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
        return;
      }

      if (!response.ok) {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).join(", ");
          setError(errorMessages);
        } else {
          setError(result.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
        }
        return;
      }

      console.log("تم التسجيل بنجاح:", result);
      setSuccess("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.");
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
    } catch (error) {
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
        <header className={classes.login_header}></header>

        <div className={classes.login_body}>
          <section className={classes.login_body_left}>
            <div className={classes.login_body_left_image}>
              <h1>{content[0].h1}</h1>
              <p>{content[0].p}</p>
            </div>
          </section>

          <section className={classes.login_body_right}>
            <div className={classes.login_body_right_text}>
              <h1>تسجيل</h1>
              <p>استعد لمستقبل مليء بالنجوم.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <InputField
                type="text"
                id="name"
                placeholder="الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <InputField
                type="email"
                id="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

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
                  className={`${classes.role} ${role === "Student" ? classes.active : ""}`}
                  onClick={() => setRole("Student")}
                >
                  <label htmlFor="Student">طالب</label>
                  <input
                    type="radio"
                    name="role"
                    value="Student"
                    checked={role === "Student"}
                    onChange={() => setRole("Student")}
                  />
                </div>
                <div
                  className={`${classes.role} ${role === "Instructor" ? classes.active : ""}`}
                  onClick={() => setRole("Instructor")}
                >
                  <label htmlFor="Instructor">مدرس</label>
                  <input
                    type="radio"
                    name="role"
                    value="Instructor"
                    checked={role === "Instructor"}
                    onChange={() => setRole("Instructor")}
                  />
                </div>
                <div
                  className={`${classes.role} ${role === "Admin" ? classes.active : ""}`}
                  onClick={() => setRole("Admin")}
                >
                  <label htmlFor="Admin">مسؤول</label>
                  <input
                    type="radio"
                    name="role"
                    value="Admin"
                    checked={role === "Admin"}
                    onChange={() => setRole("Admin")}
                  />
                </div>
              </div>


              <div className={classes.form_group}>
                <button type="submit">{content[0].button}</button>
              </div>

              {error && <p className={classes.error}>{error}</p>}
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