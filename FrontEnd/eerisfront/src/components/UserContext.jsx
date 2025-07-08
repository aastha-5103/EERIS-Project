import React, { createContext, useContext, useState, useEffect } from "react";


const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Store the whole user object, or specific fields
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
  }, []);

  const setUser = (userData) => {
    setUserState(userData);
    // Store necessary info in localStorage, potentially as JSON string
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
     setUserState('');
     localStorage.removeItem("user");
     // Optionally clear other storage too
  }

  // Provide user object, setUser function, and logout function
  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);