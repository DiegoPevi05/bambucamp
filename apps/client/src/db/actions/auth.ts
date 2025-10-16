import {toast} from 'sonner';
import axios from 'axios';
import { User, VerifyAcccount, ForgotPassword } from '../../lib/interfaces';
import { SignIn, SignUp } from '../../lib/interfaces';
import {serializeUser} from '../serializer';


export const SignInAccount = async (signInValues: SignIn, language:string): Promise<User|null> => {

  let user: User | null = null;

  try {
    const loginResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signin`, signInValues, {
      headers: {
        'Accept-Language':language,
      }
    });

    user = serializeUser(loginResponse.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        // Handle validation errors (array of errors)
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        // Handle other types of errors
        if (statusCode) {
          toast.error(`${errorData?.error || "Error during Log In."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return user;
};

export const SignUpAccount = async (signUpValues: SignUp, language:string): Promise<boolean> => {

  try {
    const registerResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, signUpValues, {
      headers: {
        'Accept-Language':language,
      }
    });

    toast.success(registerResponse.data.message)
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        // Handle validation errors (array of errors)
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        // Handle other types of errors
        if (statusCode) {
          toast.error(`${errorData?.error || "Error during Sign Up."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return false;
};

export const VerifyAccount = async (verifyAccountValues: VerifyAcccount, language:string): Promise<boolean> => {

  try {

    // Create a URLSearchParams object to construct the query string
    const params = new URLSearchParams();
    params.append('email', verifyAccountValues.email.toString());
    params.append('code', verifyAccountValues.code.toString());

    // Construct the URL with query parameters
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/verify-email?${params.toString()}`;

    const verifyAccountResponse = await axios.get(url, {
      headers: {
        'Accept-Language':language,
      }
    });

    toast.success(verifyAccountResponse.data.message)
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        // Handle validation errors (array of errors)
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        // Handle other types of errors
        if (statusCode) {
          toast.error(`${errorData?.error || "Error during Verification Account."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return false;
};


export const ForgotPasswordAccount = async (ForgotPasswordValues: ForgotPassword, language:string): Promise<boolean> => {

  try {
    const ForgetPasswordResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, ForgotPasswordValues, {
      headers: {
        'Accept-Language':language,
      }
    });

    toast.success(ForgetPasswordResponse.data.message)
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        // Handle validation errors (array of errors)
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        // Handle other types of errors
        if (statusCode) {
          toast.error(`${errorData?.error || "Error during Sign Up."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return false;
};


export const VerifyPasswordResetCode = async (VerifyForgotPasswordValues: ForgotPassword, language:string): Promise<boolean> => {

  try {
    const VerifyPasswordResetCodeResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-password-reset-code`, VerifyForgotPasswordValues, {
      headers: {
        'Accept-Language':language,
      }
    });

    toast.success(VerifyPasswordResetCodeResponse.data.message)
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        // Handle validation errors (array of errors)
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        // Handle other types of errors
        if (statusCode) {
          toast.error(`${errorData?.error || "Error during Verification Password Reset Code."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return false;
};

export const UpdatePassword = async (UpdatePasswordValues: ForgotPassword, language:string): Promise<boolean> => {

  try {
    const UpdatedPasswordResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/update-password`, UpdatePasswordValues, {
      headers: {
        'Accept-Language':language,
      }
    });

    toast.success(UpdatedPasswordResponse.data.message)
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        // Handle validation errors (array of errors)
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        // Handle other types of errors
        if (statusCode) {
          toast.error(`${errorData?.error || "Error during Updating Password."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return false;
};
