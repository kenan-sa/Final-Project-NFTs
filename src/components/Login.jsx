import React, { useContext, useState } from "react";
import axios from "axios";
import { authContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [user, setUser] = useState(null);
  const { userId, setUserId } = useContext(authContext);
  const nav = useNavigate();

  const handleLogin = async () => {
    try {
      setLoaderHidden(false);
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });
      if (response.statusText == "OK") {
        setUser(response.data.user);
        setUserId(response.data.user._id);
        setLoaderHidden(true);
        // nav("/discover");
        console.log(response.data);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="container mt-5">
      <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <h2>Login</h2>
      <div className="row">
        <div className="col-sm-8">
          <div className="card">
            <div className="card-body">
              <label>Email: </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
              />
              <br />
              <label>Password: </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
              />
              <br />
              <button onClick={handleLogin} className="btn btn-dark">
                Login
              </button>
              {user && (
                <div>
                  <h3>Welcome, {user.email}!</h3>
                  <p>Your tokens: {user.tokens}</p>
                  <Link to="/collection">View Collection</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
