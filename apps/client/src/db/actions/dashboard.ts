import { toast } from "sonner";
import axios from "axios";
import { Reserve, NotificationDto, notifcationFilters } from "../../lib/interfaces";
import { serializeMyReserves, serializeMyReservesCalendar, serializeNotification, serializeCalendarDays } from "../serializer";

export const getCalendarDates = async(page:Number, language:string):Promise<{ date: Date, label: string, available: boolean }[] | null> => {
  let data:{ date: Date, label: string, available: boolean }[]|null = null;
  try{

    // Create a URLSearchParams object to construct the query string
    const params = new URLSearchParams();
    params.append('page', page.toString());

    // Construct the URL with query parameters
    const url = `${import.meta.env.VITE_BACKEND_URL}/reserves/calendar?${params.toString()}`;

    const fetchedDays = await axios.get(url, {
      headers: {
        'Accept-Language':language
      }
    });

    data = serializeCalendarDays(fetchedDays.data);


  }catch(error){
    console.log(error)
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
          toast.error(`${errorData?.error || "Error fetching the calendar dates."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }

  return data;
}

export const getAllMyReservesCalendar = async(token:string, page:Number, language:string):Promise<{reserves:{ id:number, external_id:string, dateFrom:Date, dateTo:Date }[]} |null> => {
  let data:{ reserves:{ id:number, external_id:string, dateFrom:Date, dateTo:Date }[]}  | null = null;
  try{

    // Create a URLSearchParams object to construct the query string
    const params = new URLSearchParams();
    params.append('page', page.toString());

    // Construct the URL with query parameters
    const url = `${import.meta.env.VITE_BACKEND_URL}/reserves/me/calendar?${params.toString()}`;

    const fetchReserves = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language':language
      }
    });

    data = {
      reserves: fetchReserves.data.reserves.map((reserve: any) => serializeMyReservesCalendar(reserve)),
    }



  }catch(error){
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
          toast.error(`${errorData?.error || "Error fetching the dashboard reserves."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }

  return data;
}

export const getAllMyReserves = async(token:string, page:Number,pageSize:Number,language:string):Promise<{reserves:Reserve[], totalPages:Number ,currentPage:Number}|null> => {
  let data:{ reserves:Reserve[],totalPages:Number,currentPage:Number } | null = null;
  try{

    // Create a URLSearchParams object to construct the query string
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize',pageSize.toString())

    // Construct the URL with query parameters
    const url = `${import.meta.env.VITE_BACKEND_URL}/reserves/me?${params.toString()}`;

    const fetchReserves = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language':language
      }
    });


    data = {
      reserves: fetchReserves.data.reserves.map((reserve: any) => serializeMyReserves(reserve)),
      currentPage: parseInt(fetchReserves.data.currentPage as string, 10),
      totalPages:parseInt(fetchReserves.data.totalPages as string, 10)
    }



  }catch(error){
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
          toast.error(`${errorData?.error || "Error fetching the dashboard reserves."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }

  return data;
}


export const getAllNotifications = async( token: string, page:Number, pageSize:Number, language:string, filters?:notifcationFilters ): Promise<{notifications:NotificationDto[], totalPages:Number ,currentPage:Number}|null> => {

  let data:{ notifications:NotificationDto[],totalPages:Number,currentPage:Number } | null = null;
  try{
    // Create a URLSearchParams object to construct the query string
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    // Append filters to the query parameters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key as keyof notifcationFilters]) {
          params.append(key, filters[key as keyof notifcationFilters] as string);
        }
      });
    }

    // Construct the URL with query parameters
    const url = `${import.meta.env.VITE_BACKEND_URL}/notifications/user?${params.toString()}`;

    const fetchProducts = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language':language
      }
    });

    data = {
      notifications: fetchProducts.data.notifications.map((notification: any) => serializeNotification(notification)),
      currentPage: parseInt(fetchProducts.data.currentPage as string, 10),
      totalPages:parseInt(fetchProducts.data.totalPages as string, 10)
    }


  }catch(error){
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
          toast.error(`${errorData?.error || "Error fetching the notifications."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }

  return data;
}

export const downloadBillForReserve = async(idReserve:Number, token:string, language:string ):Promise<void> => {

  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reserves/bill/${idReserve}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language':language
      },
      responseType: 'arraybuffer'
    });

    // Create a Blob from the PDF data
    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

    // Create a link element
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(pdfBlob);
    link.download = `reserve_${idReserve}.pdf`; // Set the file name

    // Append to the body
    document.body.appendChild(link);

    // Programmatically trigger a click on the link to download
    link.click();

    // Clean up and remove the link element
    document.body.removeChild(link);

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
          toast.error(`${errorData?.error || "Error downloading the bill."} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }

}
