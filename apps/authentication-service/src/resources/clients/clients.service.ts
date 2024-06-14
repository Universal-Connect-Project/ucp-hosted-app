import { Client } from "auth0";

import envs from "@/config";
import { ICredentials } from "@/resources/clients/client-model";
import AuthService from "@/shared/auth/auth.service";
import { handleErrors } from "@/shared/http/http.service";

const authDomain = envs.AUTH0_DOMAIN;

const createClient = (): Client => {
  return {} as Client;
};

const Auth = AuthService.getInstance();

const getClient = async (id: string): Promise<Client | Error> => {
  const token = await Auth.getAccessToken();
  const _id = encodeURIComponent(id);

  try {
    const client = (await handleErrors(
      await fetch(`https://${authDomain}/api/v2/clients/${_id}`, {
        method: "GET",
        headers: {
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

export { createClient, getClient, getCredentials };
