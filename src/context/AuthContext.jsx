import { createContext, useState, useEffect } from "react";

export const authContext = createContext({
  userId: "",
  setUserId: (userId) => {},//func
});

export default function AuthContextProvider(props) {
  const [userId, setUserId] = useState("");
  useEffect(() => {
    console.log({ userId });
  }, [userId]);

  return (
    <authContext.Provider value={{ userId, setUserId }}>
      {props.children}
    </authContext.Provider>
  );
}
