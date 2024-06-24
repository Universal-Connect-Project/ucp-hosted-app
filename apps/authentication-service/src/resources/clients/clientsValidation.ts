import { object, string } from "yup";

export const clientCreateSchema = object({
  userId: string().trim().required(),
});
