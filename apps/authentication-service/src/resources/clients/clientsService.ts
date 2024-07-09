import { Client, ClientCreate, ResponseError } from "auth0";

import envs from "@/config";
import { ICredentials } from "@/resources/clients/clientsModel";
import { getAccessToken } from "@/shared/auth/authService";
import { parseResponse } from "@/shared/utils";
import {
  getUserClientId,
  getUserIdFromToken,
  setUserClientId,
} from "@/shared/users/usersService";

const authDomain = envs.AUTH0_DOMAIN;

export const createClient = async (
  userToken: string,
  client: ClientCreate,
): Promise<Client> => {
  const token = await getAccessToken();
  const userId = await getUserIdFromToken(userToken);

  // Check if user already has a client
  try {
    const userClientID = await getUserClientId(userId);

    if (userClientID && userClientID.length > 0) {
      return Promise.reject(
        new ResponseError(400, "User already has a client", {} as Headers),
      );
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
    return Promise.reject(
      new ResponseError(
        500,
        "Unable to create client: An unexpected error occurred",
        {} as Headers,
      ),
    );
  }
};

export const deleteClient = async (userToken: string): Promise<Client> => {
  const token = await getAccessToken();
  const userId = await getUserIdFromToken(userToken);
  const clientId = await getUserClientId(userId);

  try {
    const client: Client = (await parseResponse(
      await fetch(
        `https://${authDomain}/api/v2/clients/${encodeURIComponent(clientId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      ),
    )) as Client;

    // Remove client id from user
    await setUserClientId(userId, "");

    return Promise.resolve(client);
  } catch (error) {
    console.log(error);
    return Promise.reject(
      new ResponseError(
        500,
        "Unable to delete client: An unexpected error occurred",
        {} as Headers,
      ),
    );
  }
};

export const getClient = async (userToken: string): Promise<Client> => {
  const token: string = await getAccessToken();
  const clientId = await getUserClientId(await getUserIdFromToken(userToken));

  try {
    const client: Client = (await parseResponse(
      await fetch(
        `https://${authDomain}/api/v2/clients/${encodeURIComponent(clientId)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      ),
    )) as Client;

    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(
      new ResponseError(500, "An unexpected error occurred", {} as Headers),
    );
  }
};

export const getClientCredentials = (client: Client): Promise<ICredentials> => {
  try {
    return Promise.resolve({
      id: client.client_id,
      secret: client.client_secret,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};
