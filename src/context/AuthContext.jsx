import { createContext, useState, useEffect } from "react";

export const authContext = createContext({
  userId: "",
  setUserId: (userId) => {}, //func
});

export default function AuthContextProvider(props) {
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("userId") || "";
  });

  useEffect(() => {
    localStorage.setItem("userId", userId);
    console.log("userId: "+userId);
  }, [userId]);

  // // const [userId, setUserId] = useState();
  // // useEffect(() => {
  // //   console.log({ userId });
  // //   if (userId != undefined) {
  // //     localStorage.setItem("userId", userId);
  // //   }
  // // }, [userId]);

  // // useEffect(() => {
  // //   if (localStorage.getItem("userId")) {
  // //     setUserId(localStorage.getItem("userId"));
  // //   }
  // // }, []);

  return (
    <authContext.Provider value={{ userId, setUserId }}>
      {props.children}
    </authContext.Provider>
  );
}
