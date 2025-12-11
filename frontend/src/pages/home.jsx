import { useEffect } from "react";
import api from "../api/axios";

export default function Home() {
  useEffect(() => {
    console.log("API URL:", import.meta.env.VITE_API_URL);

    api.get("/test")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h1>Home Page</h1>;
}
