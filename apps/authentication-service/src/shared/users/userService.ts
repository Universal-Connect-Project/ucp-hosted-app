import envs from "@/config";
import { AuthService } from "@/shared/auth/authService";
import { parseResponse } from "@/shared/utils";

const authDomain = envs.AUTH0_DOMAIN;
const Auth = AuthService.getInstance();

export type User = {
  user_metadata: {
    client_id: string;
  };
  [key: string]: unknown;
};

export const getUserById = async (userId: string): Promise<User> => {
  const token = await Auth.getAccessToken();
  const userIdEncoded = encodeURIComponent(userId);

  try {
    return (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/users/${userIdEncoded}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    )) as Promise<User>;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getUserClientId = async (userId: string): Promise<string> => {
  try {
    const userInfo: User = await getUserById(userId);
    return Promise.resolve(userInfo?.user_metadata?.client_id || "");
  } catch (error) {
    return Promise.reject(error);
  }
};

export const setUserClientId = async (
  userId: string,
  clientId: string,
): Promise<User> => {
  const token = await Auth.getAccessToken();
  const userIdEncoded = encodeURIComponent(userId);
  const clientIdEncoded = encodeURIComponent(clientId);

  try {
    const user: User = (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/users/${userIdEncoded}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_metadata: {
            client_id: clientIdEncoded,
          },
        }),
      }),
    )) as User;

    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};
