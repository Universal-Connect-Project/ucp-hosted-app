import { JSONApiResponse, UserInfoClient, UserInfoResponse } from "auth0";

import envs from "@/config";
import { getAccessToken } from "@/shared/auth/authService";
import { User } from "@/shared/users/usersModel";
import { parseResponse } from "@/shared/utils";

const authDomain = envs.AUTH0_DOMAIN;
const userInfo: UserInfoClient = new UserInfoClient({
  domain: envs.AUTH0_DOMAIN,
  clientInfo: {
    scopes: ["openid", "profile", "email", "offline_access"],
    name: envs.AUTH0_CLIENT_ID,
  },
});

export const getArrayOfUserProps = (users: User[], key: string): string[] => {
  return users.map((user: User) => user[key]) as string[];
};

const getUserInfoFromToken = async (
  token: string,
): Promise<JSONApiResponse<UserInfoResponse>> => {
  return await userInfo.getUserInfo(token);
};

export const getUserIdFromToken = async (token: string): Promise<string> => {
  const user: JSONApiResponse<UserInfoResponse> =
    await getUserInfoFromToken(token);
  return Promise.resolve(user.data.sub);
};

export const getUserById = async (userId: string): Promise<User> => {
  const token = await getAccessToken();
  const userIdEncoded = encodeURIComponent(userId);

  return await parseResponse<User>(
    await fetch(`https://${authDomain}/api/v2/users/${userIdEncoded}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
  );
};

export const getUsersByClientId = async (clientId: string): Promise<User[]> => {
  const token = await getAccessToken();
  const clientIdEncoded = encodeURIComponent(clientId);

  const users: User[] = await parseResponse<User[]>(
    await fetch(
      `https://${authDomain}/api/v2/users?q=user_metadata.client_id=${clientIdEncoded}`,
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

  return Promise.resolve(users);
};

export const getUserClientId = async (userId: string): Promise<string> => {
  const userInfo: User = await getUserById(userId);
  return Promise.resolve(userInfo?.user_metadata?.client_id || "");
};

export const setUserClientId = async (
  userId: string,
  clientId: string,
): Promise<User> => {
  const token = await getAccessToken();
  const userIdEncoded = encodeURIComponent(userId);
  const clientIdEncoded = encodeURIComponent(clientId);

  const user: User = await parseResponse<User>(
    await fetch(`https://${authDomain}/api/v2/users/${userIdEncoded}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_metadata: {
          client_id: clientId.length === 0 ? null : clientIdEncoded,
        },
      }),
    }),
  );

  return Promise.resolve(user);
};
