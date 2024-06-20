import { getUserClientId, setUserClientId } from "@/shared/user/userService";
import { Client, ClientCreate } from "auth0";

import envs from "@/config";
import { ICredentials } from "@/resources/clients/clientsModel";
import { AuthService } from "@/shared/auth/authService";
import { parseResponse } from "@/shared/utils";

const authDomain = envs.AUTH0_DOMAIN;
const Auth = AuthService.getInstance();

export const createClient = async (
  userId: string,
  client: ClientCreate,
): Promise<Client> => {
  const token = await Auth.getAccessToken();

  // Check if user already has a client
  try {
    const userClientID = await getUserClientId(userId);

    if (userClientID && userClientID.length > 0) {
      return Promise.reject(new Error("User already has a client"));
    }
  } catch (error) {
    return Promise.reject(error);
  }

  // Create new client
  try {
    const newClient: Client = (await parseResponse(
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
    )) as Client;

    await setUserClientId(userId, newClient.client_id);

    return Promise.resolve(newClient);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteClient = async (id: string): Promise<Client> => {
  const token = await Auth.getAccessToken();
  const idEncoded = encodeURIComponent(id);

  try {
    const client: Client = (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/clients/${idEncoded}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    )) as Client;

    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getClient = async (id: string): Promise<Client> => {
  const token = await Auth.getAccessToken();
  const _id = encodeURIComponent(id);

  try {
    const client: Client = (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/clients/${_id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    )) as Client;

    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCredentials = (): Promise<ICredentials> => {
  return Promise.resolve({
    id: "placeholder_id",
    secret: "placeholder_secret",
  });
};
