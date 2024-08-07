import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ApiKeys from "./ApiKeys/ApiKeys";

const Home = () => {
  const { logout } = useAuth0();

  return (
    <>
      <ApiKeys />
      <button onClick={() => void logout()}>Log out</button>
    </>
  );
};

export default Home;
