import { api, TagTypes } from "../../baseApi";
import { HttpMethods } from "../../shared/constants/http";

interface CreateInstitution {
  name: string;
  url: string;
  logoUrl: string;
  routingNumbers: string[];
  keywords: string[];
  isTestInstitution: boolean;
}

const INSTITUTION_SERVICE_BASE_URL = `http://localhost:8088`;

export const AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL = `${INSTITUTION_SERVICE_BASE_URL}/institutions/`;

export const institutionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createInstitution: builder.mutation<void, CreateInstitution>({
      query: ({
        isTestInstitution,
        keywords,
        name,
        logoUrl,
        url,
        routingNumbers,
      }) => {
        return {
          body: {
            is_test_bank: isTestInstitution,
            keywords: Array.from(new Set(keywords)).join(" "),
            name,
            logo: logoUrl,
            url,
            routing_numbers: routingNumbers,
          },
          method: HttpMethods.POST,
          url: AUTHENTICATION_SERVICE_CREATE_API_KEYS_URL,
        };
      },
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateInstitutionMutation } = institutionsApi;
