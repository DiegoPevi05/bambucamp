import { z } from 'zod';

const formHomeSchema = z.object({
  name: z.string().nonempty({ message: 'validations.name_required' }),
  email: z.string().nonempty({ message: 'validations.email_required' }).email({ message: 'validations.email_invalid' }),
  message: z.string().nonempty({ message: 'validations.message_required' }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "validations.email_invalid" }),
  password: z.string().min(6, { message: "validations.password_length" }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: "validations.email_invalid" }),
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, { message: "validations.password_format" }),
  confirmPassword: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, { message: "validations.password_format" }),
  firstName: z.string().nonempty({ message: "validations.first_name_required" }),
  lastName: z.string().nonempty({ message: "validations.last_name_required" }),
  phoneNumber:z.string().nonempty({ message: "validations.phone_required" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "validations.passwords_missmatch", path: ["confirmPassword"], });

const userInfoReserveSchema = z.object({
  email: z.string().email({ message: "validations.email_invalid" }),
  firstName: z.string().nonempty({ message: "validations.first_name_required" }),
  lastName: z.string().nonempty({ message: "validations.last_name_required" }),
  phoneNumber:z.string().nonempty({ message: "validations.phone_required" }),
  document_type:z.string().nonempty({ message: "validations.document_type_required" }),
  document_id:z.string().nonempty({message:"validations.document_id_required"})
})

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "validations.email_invalid" }),
});

const validateCodeSchema = z.object({
  code: z.string().length(6, { message: "validations.restore_password_code_length" }),
});

const resetPasswordSchema = z.object({
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, { message: "validations.password_format" }),
  confirmPassword: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, { message: "validations.password_format" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "validations.passwords_missmatch", path: ["confirmPassword"], });






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


const userSchema = z.object({
  email: z.string().email({ message: "Email is not valid." }),
  firstName: z.string().nonempty({ message: "First name is required." }),
  lastName: z.string().nonempty({ message: "Last name is required." }),
  phoneNumber: z.string().nonempty({ message: "Phone number is required." }),
});

export {formHomeSchema, guestsSchema, searchSchema, signInSchema, signUpSchema, forgotPasswordSchema, validateCodeSchema, resetPasswordSchema, userSchema ,userInfoReserveSchema};
