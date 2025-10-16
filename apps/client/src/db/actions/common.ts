import { toast } from "sonner";
import { ContactForm, webContent, ComplaintForm } from "../../lib/interfaces";
import axios from "axios";
import { serializeFaq, serializeReview, serializeTent, serializeExperience } from "../serializer";

export const getContentWeb = async (language: string): Promise<webContent | null> => {
  let data: webContent | null = null

  try {
    // Construct the URL with query parameters
    const url = `${import.meta.env.VITE_BACKEND_URL}/web`;


    const webContentResponse = await axios.get(url, {
      headers: {
        'Accept-Language': language,
      }
    });


    data = {
      bundles:webContentResponse.data.bundles.map((experience: any) => serializeExperience(experience)),
      tents: webContentResponse.data.tents.map((tent: any) => serializeTent(tent)),
      reviews: webContentResponse.data.reviews.map((review: any) => serializeReview(review)),
      faqs: webContentResponse.data.faqs.map((faq: any) => serializeFaq(faq)),
    }

    return data;

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
          toast.error(`${errorData?.error || "Error during Fetching the category products."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return null;
};


export const ContactFormSubmit = async (contactFormValues: ContactForm, language: string): Promise<boolean> => {

  try {
    const contactFormResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/web/contact`, contactFormValues, {
      headers: {
        'Accept-Language': language,
      }
    });

    toast.success(contactFormResponse.data.message);
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
          toast.error(`${errorData?.error || "Error during Sending Form."} (Code: ${statusCode})`);
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

export const ClaimFormSubmit = async (values: ComplaintForm, language: string): Promise<boolean> => {
  try {
    const url = `${import.meta.env.VITE_BACKEND_URL}/web/complaint`;
    const res = await axios.post(url, values, {
      headers: { "Accept-Language": language },
    });
    toast.success(res.data?.message ?? "Formulario enviado con éxito.");
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const data = error.response?.data;
      const msg = data?.error;

      if (Array.isArray(msg)) {
        msg.forEach((e) => toast.error(e.msg || "Validation error."));
      } else {
        if (statusCode) toast.error(`${msg || "Error al enviar el formulario."} (Code: ${statusCode})`);
        else toast.error(msg || "Ocurrió un error.");
      }
    } else {
      toast.error("Ocurrió un error inesperado.");
    }
    console.error(error);
    return false;
  }
};
