import { PublicClientApplication } from "@azure/msal-browser";
console.log("MSAL Config Loaded");
console.log("Microsoft Client ID:", import.meta.env.VITE_MICROSOFT_CLIENT_ID);

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: import.meta.env.VITE_MICROSOFT_AUTHORITY,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().catch((error) => {
  console.error("MSAL initialization error:", error);
});

export { msalInstance };
