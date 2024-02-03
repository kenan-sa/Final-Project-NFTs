import React, { useContext, useEffect, useState } from "react";
import logo from "../assets/logo.png";
import Minter from "./Minter";
import Login from "./Login";
import Signup from "./Signup";
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { authContext } from "../context/AuthContext";

function Header() {
  const { userId, setUserId } = useContext(authContext);
  const nav = useNavigate();

  function handleLogOut() {
    setUserId("");
    nav("/");
  }

  return (
    <div className="app-root-1">
      <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
        <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
          <div className="header-left-4"></div>
          <img className="header-logo-11" src={logo} />
          <div className="header-vertical-9 "></div>
          <Link to="/">
            <h5 className="Typography-root header-logo-text">CosmoNexus</h5>
            <div className="media-greaterThanOrEqual-md"></div>
          </Link>
          <div className="header-empty-6"></div>
          <div className="header-space-8"></div>

          {userId && (
            <button
              className="ButtonBase-root Button-root Button-text header-navButtons-3"
              onClick={handleLogOut}
            >
              Sign Out
            </button>
          )}

          {!userId && (
            <>
              <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
                <Link to="/signup">Sign Up</Link>
              </button>
              <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
                <Link to="/login">Sign In</Link>
              </button>
            </>
          )}

          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
            <Link to="/discover">Discover</Link>
          </button>
          {userId && (
            <>
              <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
                <Link to="/minter">Minter</Link>
              </button>
              <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
                <Link to="/collection">My NFTs</Link>
              </button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
