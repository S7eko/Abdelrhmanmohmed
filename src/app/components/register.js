"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
      setError("All fields are required.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%&!*^])[A-Za-z\d@#$%&!*^]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must include at least one uppercase letter, one special character (@, #, $, %, etc.), and be at least 8 characters long."
      );
      return;
    }

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
        console.error("JSON parsing error:", jsonError);
        setError("An unexpected error occurred. Please try again.");
        return;
      }

      if (!response.ok) {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).join(", ");
          setError(errorMessages);
        } else {
          setError(result.message || "Registration failed. Please try again.");
        }
        return;
      }

      console.log("Registration successful:", result);
      setSuccess("Registration successful! Redirecting to login...");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setRole("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/course/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  const content = {
    h3: "Homepage",
    h1: "One Step Closer to Your Dream",
    p: "A free E-Learning service ready to help you become an expert.",
    button: "Register",
    span: "Already have an account?",
    a: "Log In",
  };

  return (
    <div className={classes.login}>
      <div className={classes.login_content}>
        <header className={classes.login_header}></header>

        <div className={classes.login_body}>
          <section className={classes.login_body_left}>
            <div className={classes.login_body_left_image}>
              <h1>{content.h1}</h1>
              <p>{content.p}</p>
            </div>
          </section>

          <section className={classes.login_body_right}>
            <div className={classes.login_body_right_text}>
              <h1>Register</h1>
              <p>Get ready for a future full of achievements.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <InputField
                type="text"
                id="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <InputField
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <InputField
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Role Selection */}
              <div className={classes.select}>
                <div
                  className={`${classes.role} ${role === "Student" ? classes.active : ""}`}
                  onClick={() => setRole("Student")}
                >
                  <label htmlFor="Student">Student</label>
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
                  <label htmlFor="Instructor">Instructor</label>
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
                  <label htmlFor="Admin">Admin</label>
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
                <button type="submit">{content.button}</button>
              </div>

              {error && <p className={classes.error}>{error}</p>}
              {success && <p className={classes.success}>{success}</p>}

              <span>
                {content.span} <Link href="/course/login">{content.a}</Link>
              </span>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Register;