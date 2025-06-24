export const BASE_ROUTE = "/";
export const INSTITUTIONS_ROUTE = "/institutions";
export const PUBLIC_BASE_ROUTE = "/public";

const createPublicRoute = (childRoute: string) => ({
  childRoute,
  fullRoute: `${PUBLIC_BASE_ROUTE}/${childRoute}`,
});
export const PERFORMANCE_ROUTE = BASE_ROUTE;

export const DEMO_ROUTE = "/demo";

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

export const demoRoute = createRoute("demo");
