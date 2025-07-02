import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateCourse from "./pages/CreateCourse"; // ✅ new page

function App() {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState(""); // "teacher" or "student"

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Login setUsername={setUsername} setUserType={setUserType} />
          }
        />
        <Route
          path="/teacher"
          element={<TeacherDashboard  />}
        />
        <Route
          path="/student"
          element={<StudentDashboard />}
        />
        <Route
          path="/create-course"
          element={<CreateCourse />}
        />
      </Routes>
    </Router>
  );
}

export default App;
