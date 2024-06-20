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

export const getUserClientId = async (userId: string): Promise<string> => {
  const token = await Auth.getAccessToken();
  const userIdEncoded = encodeURIComponent(userId);

  let userClientId: string;

  try {
    const userInfo: User = (await parseResponse(
      await fetch(`https://${authDomain}/api/v2/users/${userIdEncoded}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    )) as User;

    userClientId = userInfo?.user_metadata?.client_id;

    return Promise.resolve(userClientId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const setUserClientId = async (
  userId: string,
  clientId: string,
): Promise<void> => {
  const token = await Auth.getAccessToken();
  const userIdEncoded = encodeURIComponent(userId);
  const clientIdEncoded = encodeURIComponent(clientId);

  try {
    await parseResponse(
      await fetch(`https://${authDomain}/api/v2/users/${userIdEncoded}`, {
        method: "POST",
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
    );

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};
