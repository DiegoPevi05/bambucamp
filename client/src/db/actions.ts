import { searchSchema } from './schemas';
import {toast} from 'sonner';
import { ZodError } from 'zod';

// Define the type for search values based on the schema
type SearchValues = {
  startDate: Date;
  endDate: Date;
  guests: {
    adults: number;
    kids: number;
    babys: number;
  };
};

export const SearchReservation = async (searchValues: SearchValues): Promise<void> => {
  try {
    searchSchema.parse(searchValues);
    toast.success("Search is valid");
    // Execute any other async operations if needed
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        toast.error(err.message);
      });
    } else {
      toast.error("Invalid search values.");
      console.error(error);
    }
  }
};

/*
// Define the type for the data returned by the fetch
type SomeData = {
  // Define the structure of the data you expect from the API
  // For example:
  id: number;
  name: string;
  // Add other fields as needed
};

export const fetchSomeData = async (): Promise<SomeData | null> => {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: SomeData = await response.json();
    return data;
  } catch (error) {
    toast.error("Failed to fetch data.");
    console.error(error);
    return null;
  }
};*/
