import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Store values in localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("userType", data.type);
      localStorage.setItem("_id",data.id);

      // ✅ Redirect based on type
      if (data.type === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } else {
      alert(data.error || "Login failed");
    }
  };
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#0d1117",
      fontFamily: "Arial, sans-serif",
    },
    formBox: {
      backgroundColor: "#161b22",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
      width: "350px",
      textAlign: "center",
    },
    heading: {
      fontSize: "2rem",
      color: "#fff",
      marginBottom: "30px",
    },
    label: {
      display: "block",
      textAlign: "left",
      marginBottom: "8px",
      fontSize: "0.95rem",
      color: "#c9d1d9",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "20px",
      borderRadius: "8px",
      border: "1px solid #30363d",
      backgroundColor: "#0d1117",
      color: "#e6edf3",
      fontSize: "1rem",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#1f6feb",
      border: "none",
      borderRadius: "8px",
      color: "white",
      fontSize: "1rem",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    buttonHover: {
      backgroundColor: "#388bfd",
    },
    forgot: {
      marginTop: "15px",
      fontSize: "0.9rem",
      color: "#8b949e",
      cursor: "pointer",
    },
  };

  return (

    <div style={styles.container}>
      <div style={styles.formBox}>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Username</label>
          <input type="name" style={styles.input} placeholder="Enter email" value={username}
          onChange={(e) => setUsername(e.target.value)}/>

          <label style={styles.label}>Password</label>
          <input type="password" style={styles.input} placeholder="Enter password" value={password}
          onChange={(e) => setPassword(e.target.value)}/>

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#388bfd")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#1f6feb")}
          >
            Log in
          </button>
        </form>
      </div>

    </div>
  );
}

export default Login;
