export const INSTITUTIONS_ROUTE = "/";

export const TERMS_AND_CONDITIONS_ROUTE = "/termsAndConditions";

const createRoute = (childRoute: string) => ({
  childRoute,
  fullRoute: `/${childRoute}`,
});

export const widgetManagementRoute = createRoute("widget-management");

export const institutionRoute = {
  ...createRoute("institutions/:institutionId"),
  createPath: ({ institutionId }: { institutionId: string }) =>
    `/institutions/${institutionId}`,
};
