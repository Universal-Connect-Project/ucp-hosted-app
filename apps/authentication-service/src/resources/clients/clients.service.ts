import { Client } from "auth0";

type Credentials = {
  id: string;
  secret: string;
};

const createClient = (): Client => {
  return {} as Client;
};

const getClient = (): Client => {
  return {} as Client;
};

const getCredentials = (): Credentials => {
  return {
    id: "",
    secret: "",
  } as Credentials;
};

export default {
  createClient,
  getClient,
  getCredentials,
};
