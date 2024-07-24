import { Client, ClientCreate } from "auth0";

import envs from "@/config";
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
  // console.log("creating client", client);
  // console.log("user token", userToken);
  const token = await getAccessToken();
  // console.log("token (getAccessToken) ---->", token);
  const userId = await getUserIdFromToken(userToken);

  // Check if user already has a client
  const userClientID = await getUserClientId(userId);

  // console.log("userId", userId);
  // console.log("userClientID", userClientID);

  if (userClientID && userClientID.length > 0) {
    return Promise.reject("User already has a client");
  }

  // Create new client
  const newClient: Client = await parseResponse(
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
  );

  // console.log("newClient", newClient);

  await setUserClientId(userId, newClient.client_id);

  return newClient;
};

export const getClient = async (userToken: string): Promise<Client> => {
  const token = await getAccessToken();
  const clientId = await getUserClientId(await getUserIdFromToken(userToken));
  console.log("token (getAccessToken) ---->", token);
  console.log("clientId", clientId);

  return await parseResponse<Client>(
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
  );
};

export const deleteClient = async (userToken: string): Promise<string> => {
  const token = await getAccessToken();
  const userId = await getUserIdFromToken(userToken);
  const clientId = await getUserClientId(userId);

  await parseResponse(
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
  );

  // Remove client id from user
  await setUserClientId(userId, "");

  return "Client successfully deleted.";
};
