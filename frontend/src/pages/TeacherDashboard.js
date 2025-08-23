import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const _id=localStorage.getItem("_id");

  useEffect(() => {
    if (!_id) return;

    fetch(`${API_BASE_URL}/courses/by-user?user_id=${_id}`)
      .then(res => res.json())
      .then(data => {setCourses(data); console.log(data)})
      .catch(err => console.error("Error loading courses:", err));
  }, [_id]);

  const handleCreate = () => {
    navigate("/create-course");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Courses</h1>
      <button
        onClick={handleCreate}
        style={styles.button}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#388bfd")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#1f6feb")}
      >
        Build a New Course
      </button>
      <div style={styles.courses}>
        {courses.map(course => (
          <div
          style={styles.card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0px 6px 18px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <h2 style={styles.cardTitle}>{course.course_data.courseTitle}</h2>
          <p style={styles.cardText}>
            {course.course_data.courseDescription}
          </p>
        </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
    container: {
      textAlign: "center",
      padding: "50px 20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#0d1117",
      color: "#e6edf3",
      minHeight: "100vh",
    },
    heading: {
      fontSize: "2.5rem",
      marginBottom: "20px",
    },
    button: {
      backgroundColor: "#1f6feb",
      color: "white",
      border: "none",
      padding: "12px 24px",
      fontSize: "1rem",
      borderRadius: "8px",
      cursor: "pointer",
      marginBottom: "40px",
      transition: "background-color 0.3s",
    },
    courses: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      flexWrap: "wrap",
    },
    card: {
      backgroundColor: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "12px",
      padding: "20px",
      width: "280px",
      textAlign: "left",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    cardTitle: {
      fontSize: "1.2rem",
      marginBottom: "10px",
      color: "#fff",
    },
    cardText: {
      fontSize: "0.95rem",
      color: "#b1bac4",
      lineHeight: "1.4",
    },
  };

export default TeacherDashboard;
