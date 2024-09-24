export const INSTITUTIONS_ROUTE = "/";

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
