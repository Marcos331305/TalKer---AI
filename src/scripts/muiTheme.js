import {createTheme} from "@mui/material/styles";

// Mui Themes
const systemTheme = createTheme({
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitTapHighlightColor: "transparent", // Disables tap highlight on mobile devices
                    WebkitTouchCallout: "none",            // Disable the callout (long tap context)
                },
            },
        },
    },
    palette: {
        background: {
            default: "#212121", // Sets background color for the entire app
        },
        primary: {
            main: "#B4B4B4", // Icons color
        },
        secondary: {
            main: "#2F2F2F", // hover background colors somewhere
        },
        text: {
            primary: '#ECECEC', // Messages color
            secondary: '#B4B4B4', // Icons color
          },
        customColors:{
            borderColor: '#424242',
            specialBorderColor: '#5D5D5D', // bordercolor for moreOptions and userMenu
            customColor: '#FFFFFF', // otherIcons color or text color
            sideBarBgColor: '#171717',
            customColor2: '#000000', // sendBtn's arrow color when input is there
            customColor3: '#2F2F2F', // sendBtn's arrow color when noInput is there,
            customColor4: '#676767', // sendBtn'a arrow Bgcolor when noInput is there
            hoverColor: '#424242', // hoverColor in moreOption and MenuofUser
            delete: '#F93A37', // deleteIcon and text color
            moreOptionIconsColor: '#E3E3E3',
            generatingWaitColor: '#757575',
            convoHoverColor: '#1E1E1E',
            convoActiveColor: '#212121'
        }
    },
    typography: {
        fontFamily: "Arial, sans-serif", // Set the font for the entire app
        h6: {
            fontWeight: 600, // Customize specific variant like your navbar title
        },
        // Customize more typography variants if needed
    },
});

export const lightTheme = createTheme({
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitTapHighlightColor: "transparent", // Disables tap highlight on mobile devices
                    WebkitTouchCallout: "none",            // Disable the callout (long tap context)
                },
            },
        },
    },
    palette: {
        background: {
            default: "#FFFFFF", // Sets background color for the entire app
        },
        primary: {
            main: "#5D5D5D", // Icons color
        },
        secondary: {
            main: "#2F2F2F", // hover background colors somewhere
        },
        text: {
            primary: '#ECECEC', // Messages color
            secondary: '#B4B4B4', // Icons color
          },
        customColors:{
            borderColor: '#424242',
            specialBorderColor: '#5D5D5D', // bordercolor for moreOptions and userMenu
            customColor: '#FFFFFF', // otherIcons color or text color
            sideBarBgColor: '#171717',
            customColor2: '#000000', // sendBtn's arrow color when input is there
            customColor3: '#2F2F2F', // sendBtn's arrow color when noInput is there,
            customColor4: '#676767', // sendBtn'a arrow Bgcolor when noInput is there
            hoverColor: '#424242', // hoverColor in moreOption and MenuofUser
            delete: '#F93A37', // deleteIcon and text color
            moreOptionIconsColor: '#E3E3E3'
        }
    },
    typography: {
        fontFamily: "Arial, sans-serif", // Set the font for the entire app
        h6: {
            fontWeight: 600, // Customize specific variant like your navbar title
        },
        // Customize more typography variants if needed
    },
  });

export default systemTheme;