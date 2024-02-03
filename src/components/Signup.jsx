// Signup.js
import React, { useContext, useEffect, useState } from "react";
import { authContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);
  const { userId, setUserId } = useContext(authContext);
  const nav = useNavigate();

  const handleRegister = async () => {
    try {
      setLoaderHidden(false);
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          //to tell the server that we are sending json
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.user._id);
        console.log("Signup successful:", data.user);
        setLoaderHidden(true);
        nav("/discover");
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData.message);
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <div className="signInContainer">
      {!userId && (
        <>
          <div hidden={loaderHidden} className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <h2 className="text-white">Registration</h2>
          <div className="col-sm-4">
            <div className="card">
              <div className="card-body">
                <label>Email: </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="form-control"
                />
                <br />
                <label>Password: </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="form-control"
                />
                <br />
                <button onClick={handleRegister} className="btn btn-dark">
                  Register
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Signup;
