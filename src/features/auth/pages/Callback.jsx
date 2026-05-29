import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Callback() {
  const navigate = useNavigate();
  const { yahooLogin } = useAuth();

  useEffect(() => {
    let hash = window.location.hash;
    
    // If using HashRouter, check if the hash starts with /callback
    // and then get the rest of the hash for Yahoo parameters
    if (hash.startsWith("#/callback")) {
      hash = hash.substring("#/callback".length);
    }
    
    const params = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
    const idToken = params.get("id_token");

    if (idToken) {
      const decoded = jwtDecode(idToken);
      console.log("Yahoo ID Token Decoded:", decoded);
      alert(decoded.email);

      // Call the yahooLogin function to authenticate with your backend
      yahooLogin(decoded.email)
        .then(() => {
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Yahoo login failed:", err);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate, yahooLogin]);

  return <h1>Yahoo Login Processing...</h1>;
}

export default Callback;
