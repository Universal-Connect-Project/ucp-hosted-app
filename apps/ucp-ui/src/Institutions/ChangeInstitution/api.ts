import { api, TagTypes } from "../../baseApi";
import { INSTITUTION_SERVICE_BASE_URL } from "../../shared/constants/environment";
import { HttpMethods } from "../../shared/constants/http";

export interface CreateInstitution {
  name: string;
  url: string;
  logoUrl: string;
  routingNumbers: string[];
  keywords: string[];
  isTestInstitution: boolean;
}

export interface EditInstitutionParams extends CreateInstitution {
  institutionId: string;
}

interface DeleteInstitutionParams {
  institutionId: string;
}

export interface Institution {
  institution: {
    id: string;
  };
}

export const INSTITUTION_SERVICE_CREATE_INSTITUTION_URL = `${INSTITUTION_SERVICE_BASE_URL}/institutions`;
export const INSTITUTION_SERVICE_EDIT_INSTITUTION_URL = `${INSTITUTION_SERVICE_BASE_URL}/institutions/:institutionId`;

const filterJunk = (array: string[]) =>
  Array.from(new Set(array.filter((value) => value)));

const transformBody = ({
  isTestInstitution,
  keywords,
  name,
  logoUrl,
  url,
  routingNumbers,
}: CreateInstitution) => ({
  is_test_bank: isTestInstitution,
  keywords: filterJunk(keywords),
  name,
  logo: logoUrl || null,
  url,
  routing_numbers: filterJunk(routingNumbers),
});

export const institutionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createInstitution: builder.mutation<Institution, CreateInstitution>({
      query: (params) => ({
        body: transformBody(params),
        method: HttpMethods.POST,
        url: INSTITUTION_SERVICE_CREATE_INSTITUTION_URL,
      }),
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
    deleteInstitution: builder.mutation<Institution, DeleteInstitutionParams>({
      query: (params) => {
        const { institutionId } = params;
        return {
          method: HttpMethods.DELETE,
          url: `${INSTITUTION_SERVICE_CREATE_INSTITUTION_URL}/${institutionId}`,
        };
      },
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
    editInstitution: builder.mutation<Institution, EditInstitutionParams>({
      query: (params) => {
        const { institutionId } = params;
        return {
          body: transformBody(params),
          method: HttpMethods.PUT,
          url: `${INSTITUTION_SERVICE_CREATE_INSTITUTION_URL}/${institutionId}`,
        };
      },
      invalidatesTags: (result, error) =>
        !error ? [TagTypes.INSTITUTIONS] : [],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateInstitutionMutation,
  useDeleteInstitutionMutation,
  useEditInstitutionMutation,
} = institutionsApi;
