import { Client } from "auth0";
import { ICredentials } from "@/resources/clients/client-model";
import envs from "@/config";

const createClient = (): Client => {
  return {} as Client;
};

const getClient = async (): Promise<Client> => {
  const response = await fetch(
    `https://${envs.AUTH0_DOMAIN}/api/v2/clients/${envs.AUTH0_CLIENT_ID}`,
    {
      headers: {
        Authorization: `Bearer ${envs.AUTH0_CLIENT_SECRET}`,
      },
    },
  );
  const data: Client = (await response.json()) as Client;

  console.log(
    JSON.stringify(
      {
        data,
      },
      null,
      2,
    ),
  );

  return Promise.resolve(data);
};

const getCredentials = (): ICredentials => {
  return {
    id: "",
    secret: "",
  } as ICredentials;
};

export default {
  createClient,
  getClient,
  getCredentials,
};
