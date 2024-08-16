import { WidgetHostPermissions } from "@/shared/enums";
import { Client, ClientCreate, ClientGrant, ClientGrantCreate } from "auth0";

import envs from "@/config";
import { getAccessToken } from "@/shared/auth/authService";
import { parseResponse } from "@/shared/utils";
import {
  getUserClientId,
  getUserIdFromToken,
  setUserClientId,
} from "@/shared/users/usersService";
import { ResponseMessage } from "@/resources/clients/clientsModel";

const authDomain = envs.AUTH0_DOMAIN;
const widgetAudience = "ucp-widget-interactions";

export const createClient = async (
  userToken: string,
  client: ClientCreate,
): Promise<Client> => {
  const token = await getAccessToken();
  const userId = await getUserIdFromToken(userToken);

  // Check if user already has a client
  const userClientID = await getUserClientId(userId);

  if (userClientID && userClientID.length > 0) {
    return Promise.reject("User already has a client");
  }

  const newClient: Client = await parseResponse<Client>(
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
      } as ClientCreate),
    }),
  );

  await setUserClientId(userId, newClient.client_id);
  await setClientGrant({
    client_id: newClient.client_id,
    audience: widgetAudience,
    scope: [
      WidgetHostPermissions.CREATE_KEYS,
      WidgetHostPermissions.READ_KEYS,
      WidgetHostPermissions.ROTATE_KEYS,
    ],
  } as ClientGrantCreate);

  return newClient;
};

export const getClient = async (userToken: string): Promise<Client> => {
  const token = await getAccessToken();
  const clientId = await getUserClientId(await getUserIdFromToken(userToken));

  if (!clientId) {
    return Promise.reject("Not Found");
  }

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

export const deleteClient = async (
  userToken: string,
): Promise<ResponseMessage> => {
  const token = await getAccessToken();
  const userId = await getUserIdFromToken(userToken);
  const clientId = await getUserClientId(userId);

  if (!clientId) {
    return Promise.reject("Not Found");
  }

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

  return {
    message: "Keys successfully deleted",
  };
};

export const rotateClientSecret = async (
  userToken: string,
): Promise<Client> => {
  const token = await getAccessToken();
  const clientId = await getUserClientId(await getUserIdFromToken(userToken));

  if (!clientId) {
    return Promise.reject("Not Found");
  }

  return await parseResponse<Client>(
    await fetch(
      `https://${authDomain}/api/v2/clients/${encodeURIComponent(clientId)}/rotate-secret`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    ),
  );
};

export const setClientGrant = async (
  clientGrant: ClientGrantCreate,
): Promise<ClientGrant> => {
  const token = await getAccessToken();

  return await parseResponse<ClientGrant>(
    await fetch(`https://${authDomain}/api/v2/client-grants`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientGrant),
    }),
  );
};
