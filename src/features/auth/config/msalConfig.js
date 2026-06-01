import { PublicClientApplication } from "@azure/msal-browser";
console.log(import.meta.env.VITE_MICROSOFT_CLIENT_ID);
console.log(import.meta.env.VITE_MICROSOFT_REDIRECT_URI);
export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
  },
});

