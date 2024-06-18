import { Client, ClientCreate } from "auth0";

import envs from "@/config";
import { ICredentials } from "@/resources/clients/clientsModel";
import AuthService from "@/shared/auth/authService";
import { parseResponse } from "@/shared/http/httpService";

const authDomain = envs.AUTH0_DOMAIN;
const Auth = AuthService.getInstance();

const createClient = async (client: ClientCreate): Promise<Client | Error> => {
  const token = await Auth.getAccessToken();

  try {
    const newClient: Promise<Client> = (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/clients`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...client,
          app_type: "non_interactive",
        }),
      }),
    )) as Promise<Client>;

    return Promise.resolve(newClient);
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteClient = async (id: string): Promise<Client | Error> => {
  const token = await Auth.getAccessToken();
  const _id = encodeURIComponent(id);

  try {
    const client = (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/clients/${_id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    )) as Promise<Client>;

    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getClient = async (id: string): Promise<Client | Error> => {
  const token = await Auth.getAccessToken();
  const _id = encodeURIComponent(id);

  try {
    const client = (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/clients/${_id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    )) as Promise<Client>;

    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCredentials = (): Promise<ICredentials> => {
  return Promise.resolve({
    id: "placeholder_id",
    secret: "placeholder_secret",
  });
};

export { createClient, getClient, deleteClient, getCredentials };
