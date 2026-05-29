import { Button } from "./button";

export const YahooAuthButton = ({ onSuccess, onError, text = "Continue with Yahoo" }) => {
  const handleLogin = () => {
    try {
      const clientId = import.meta.env.VITE_YAHOO_CLIENT_ID;
      console.log(import.meta.env.VITE_YAHOO_CLIENT_ID);
      const redirectUri = import.meta.env.VITE_YAHOO_REDIRECT_URI;
      
      const authUrl = 
        `https://api.login.yahoo.com/oauth2/request_auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=openid email profile` +
        `&nonce=12345`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.log(error);
      alert(error.message);
      onError(error);
    }
  };

  return (
    <div className="relative p-[1.5px] rounded-md overflow-hidden w-full group transition-all duration-300">
      {/* Animated Purple Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#6001d2] via-[#720e9e] to-[#6001d2] animate-gradient-x opacity-70 group-hover:opacity-100 transition-opacity"></div>
      
      <Button
        type="button"
        onClick={handleLogin}
        className="relative w-full bg-white text-slate-700 hover:bg-slate-50 border-none h-11 font-medium transition-all"
      >
        <div className="flex items-center justify-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="#6001d2"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-1.5 5.5h3v4h-3v-4z"/>
          </svg>
          {text}
        </div>
      </Button>

      <style jsx="true">{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
