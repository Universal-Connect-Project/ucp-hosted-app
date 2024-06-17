import { object, string } from "yup";

const restrictedCharacters: RegExp = /[<>]/gi;

const clientCreateSchema = object({
  name: string()
    .trim()
    .required()
    .min(1)
    .max(50)
    .test(
      "restricted-characters",
      "The name contains restricted characters (<,>).",
      (value: string) => !restrictedCharacters.test(value),
    ),
  description: string().min(3).max(140),
});

export { clientCreateSchema };
