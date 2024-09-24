import React from "react";
import { useParams } from "react-router-dom";

const Institution = () => {
  const { institutionId } = useParams();

  return <div>{institutionId}</div>;
};

export default Institution;
