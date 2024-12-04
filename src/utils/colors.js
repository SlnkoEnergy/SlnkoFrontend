import { createTheme } from "@mui/material/styles";
const Colors = createTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
      darkBlue: "#002C4F",
      lightBlue: "#007DE1",
      red: "#DF1E23",
    },

    secondary: {
      main: "#013C6B",
      blue: "#007DE1",
      lightBlue: "#008EFF",
      brown: "#353535",
      lightGreen: "#00C1B6",
      yellow: "#F0CA00",
      purple: "#DC77FF",
      darkPurple: "#A300F0",
      black: "#000000",
      cardBackground: "#F5F5F5",
      grey: "#808080",
      lightGrey: "#D9D9D9",
    },

    background: {
      main: "#E2F2FF",
      lightBlue: "#2877B6",
      lightGreen: "#afe0dd",
      lightRed: "#edd5d6",
      lightskyBlue: "#b3d2f2",
    },
  },
});

export default Colors;