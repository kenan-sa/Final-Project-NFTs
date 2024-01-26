import React from "react";
import App from "./components/App";
import AuthContextProvider from "./context/AuthContext";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import Login from "./components/Login";
import Minter from "./components/Minter";
import Signup from "./components/Signup";
import homeImage from "./assets/home-img.png";
import Header from "./components/Header";
import Footer from "./components/Footer";

const root = createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  {
    index: true,//MAIN PAGE "HOME"
    path: "/",
    element: (
      <>
        <Header />
        <App />
        <Footer />
      </>
    ),
  },
  {
    path: "/signup",
    element: (
      <>
        <Header />
        <Signup />
        <Footer />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <Header />
        <Login />
        <Footer />
      </>
    ),
  },
  {
    path: "/discover",
    element: (
      <>
        <Header />
        <h1>Dicover page</h1>
        <Footer />
      </>
    ),
  },
  {
    path: "/minter",
    element: (
      <>
        <Header />
        <Minter />
        <Footer />
      </>
    ),
  },
  {
    path: "/collection",
    element: (
      <>
        <Header />
        <h1>My collection</h1>
        <Footer />
      </>
    ),
  },
]);

root.render(
  <AuthContextProvider>
    <RouterProvider router={router} />
  </AuthContextProvider>
);
