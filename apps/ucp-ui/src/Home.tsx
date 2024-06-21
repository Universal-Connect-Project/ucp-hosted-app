import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Home = () => {
  const { logout } = useAuth0();

  return (
    <>
      Hello world!
      <button onClick={() => void logout()}>Log out</button>
    </>
  );
};

export default Home;
