import { z } from 'zod';

const formHomeSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required.' }),
  email: z.string().nonempty({ message: 'Email is required.' }).email({ message: 'Email is not valid.' }),
  title: z.string().nonempty({ message: 'Title is required.' }),
  message: z.string().nonempty({ message: 'Message is required.' }),
  saveinfo: z.boolean(),
});

const guestsSchema = z.object({
  adults: z.number().min(1, { message: "There must be at least one adult." }),
  kids: z.number().min(0, { message: "Number of kids cannot be negative." }),
  babys: z.number().min(0, { message: "Number of babies cannot be negative." }),
});

const searchSchema = z.object({
  startDate: z.date({ invalid_type_error: "Start date must be a valid date." }),
  endDate: z.date({ invalid_type_error: "End date must be a valid date." }),
  guests: guestsSchema,
}).refine((data) => data.startDate < data.endDate, {
  message: "Start date must be before end date.",
  path: ["endDate"],
});

export {formHomeSchema, guestsSchema, searchSchema };
