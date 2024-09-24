import { api, TagTypes } from "../baseApi";

interface InstitutionPermissions {
  canCreateInstitution: boolean;
}

const INSTITUTION_SERVICE_BASE_URL = `http://localhost:8088`;

export const INSTITUTION_SERVICE_PERMISSIONS_URL = `${INSTITUTION_SERVICE_BASE_URL}/permissions`;

export const institutionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstitutionPermissions: builder.query<InstitutionPermissions, void>({
      query: () => INSTITUTION_SERVICE_PERMISSIONS_URL,
      providesTags: [TagTypes.INSTITUTION_PERMISSIONS],
    }),
  }),
  overrideExisting: false,
});

export const { useGetInstitutionPermissionsQuery } = institutionsApi;
