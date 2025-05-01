export const BASE_ROUTE = "/";
export const INSTITUTIONS_ROUTE = BASE_ROUTE;
export const PUBLIC_BASE_ROUTE = "/public";

const createPublicRoute = (childRoute: string) => ({
  childRoute,
  fullRoute: `${PUBLIC_BASE_ROUTE}/${childRoute}`,
});

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

export const termsAndConditionsRoute = createRoute("termsAndConditions");

export const termsAndConditionsPublicRoute =
  createPublicRoute("termsAndConditions");
