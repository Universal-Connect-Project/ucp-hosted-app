import { object, string } from "yup";

export const clientCreateSchema = object({
  clientId: string().trim().required(),
});
