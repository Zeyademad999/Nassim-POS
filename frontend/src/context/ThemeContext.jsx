import React, { createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      primary: "#000000",
      secondary: "#ffffff",
      accent: "#f2f2f2",
      danger: "#e53935",
      success: "#43a047",
      gray: "#999999",
    },
    font: {
      family: "Inter, sans-serif",
    },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => useContext(ThemeContext);
