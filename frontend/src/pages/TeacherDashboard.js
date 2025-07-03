import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) return;

    fetch(`${API_BASE_URL}/courses/by-author?author=${username}`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error loading courses:", err));
  }, [username]);

  const handleCreate = () => {
    navigate("/create-course");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.welcome}>👋 Welcome, {username}</h1>
      <div style={styles.header}>
        <h2>Your Courses</h2>
        <button onClick={handleCreate} style={styles.createButton}>
          ➕ Create New Course
        </button>
      </div>
      <div style={styles.courseList}>
        {courses.map(course => (
          <button key={course._id} style={styles.courseButton}>
            {course.title}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh"
  },
  welcome: {
    fontSize: "2rem",
    color: "#333"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
    marginBottom: "1rem"
  },
  createButton: {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  courseList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem"
  },
  courseButton: {
    padding: "1rem",
    backgroundColor: "#e0e7ff",
    border: "1px solid #c7d2fe",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    minWidth: "150px",
    textAlign: "center",
    color: "#1e40af"
  }
};

export default TeacherDashboard;
