import { api, TagTypes } from "../../baseApi";
import { HttpMethods } from "../../shared/constants/http";

export interface CreateInstitution {
  name: string;
  url: string;
  logoUrl: string;
  routingNumbers: string[];
  keywords: string[];
  isTestInstitution: boolean;
}

interface Institution {
  id: string;
}

const INSTITUTION_SERVICE_BASE_URL = `http://localhost:8088`;

export const INSTITUTION_SERVICE_CREATE_INSTITUTION_URL = `${INSTITUTION_SERVICE_BASE_URL}/institutions`;

export const institutionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createInstitution: builder.mutation<Institution, CreateInstitution>({
      query: ({
        isTestInstitution,
        keywords,
        name,
        logoUrl,
        url,
        routingNumbers,
      }) => {
        const filterJunk = (array: string[]) =>
          Array.from(new Set(array.filter((value) => value)));

        return {
          body: {
            is_test_bank: isTestInstitution,
            keywords: filterJunk(keywords),
            name,
            logo: logoUrl,
            url,
            routing_numbers: filterJunk(routingNumbers),
          },
          method: HttpMethods.POST,
          url: INSTITUTION_SERVICE_CREATE_INSTITUTION_URL,
        };
      },
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateInstitutionMutation } = institutionsApi;
