import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../../../../../lib/supabase"; // Adjust import path as needed

// Keys for AsyncStorage
export const PHONE_NUMBER_KEY = "userPhoneNumber";
export const SELECTED_COUNTRY_KEY = "selectedCountry";

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

// Country codes list
export const countryCodes: CountryCode[] = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
];

/**
 * Load phone number and country from storage
 */
export const loadPhoneData = async (): Promise<{
  phoneNumber: string;
  selectedCountry: CountryCode;
  isLoaded: boolean;
}> => {
  try {
    const [savedNumber, savedCountryCode] = await Promise.all([
      AsyncStorage.getItem(PHONE_NUMBER_KEY),
      AsyncStorage.getItem(SELECTED_COUNTRY_KEY),
    ]);

    let selectedCountry = countryCodes[0]; // Default to first country

    // Find saved country if exists
    if (savedCountryCode) {
      const country = countryCodes.find((c) => c.code === savedCountryCode);
      if (country) {
        selectedCountry = country;
      }
    }

    return {
      phoneNumber: savedNumber || "",
      selectedCountry,
      isLoaded: Boolean(savedNumber),
    };
  } catch (error) {
    console.error("Error loading phone data:", error);
    return {
      phoneNumber: "",
      selectedCountry: countryCodes[0],
      isLoaded: false,
    };
  }
};

/**
 * Save phone number to local storage and Supabase
 */
export const savePhoneNumber = async (
  phoneNumber: string,
  selectedCountry: CountryCode
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!phoneNumber.trim()) {
      return { success: false, error: "Phone number cannot be empty" };
    }

    // Store in local storage first
    await Promise.all([
      AsyncStorage.setItem(PHONE_NUMBER_KEY, phoneNumber),
      AsyncStorage.setItem(SELECTED_COUNTRY_KEY, selectedCountry.code),
    ]);

    // Format the full phone number with country code
    const fullPhoneNumber = `${selectedCountry.code}${phoneNumber}`;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: userError?.message || "User not authenticated",
      };
    }

    // Update phone in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({ phone: fullPhoneNumber })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating phone in database:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving phone number:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Fetch user's phone number from Supabase
 */
export const fetchUserPhoneFromDB = async (): Promise<{
  phoneNumber: string;
  selectedCountry: CountryCode | null;
  success: boolean;
  error?: string;
}> => {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        phoneNumber: "",
        selectedCountry: null,
        success: false,
        error: userError?.message || "User not authenticated",
      };
    }

    // Get phone number from database
    const { data, error } = await supabase
      .from("users")
      .select("phone")
      .eq("id", user.id)
      .single();

    if (error) {
      return {
        phoneNumber: "",
        selectedCountry: null,
        success: false,
        error: error.message,
      };
    }

    // If no phone number found
    if (!data?.phone) {
      return {
        phoneNumber: "",
        selectedCountry: null,
        success: true,
      };
    }

    // Parse the phone number to extract country code
    const fullPhoneNumber = data.phone;
    let matchedCountry = null;
    let phoneNumberWithoutCode = fullPhoneNumber;

    // Find which country code the phone number starts with
    for (const country of countryCodes) {
      if (fullPhoneNumber.startsWith(country.code)) {
        matchedCountry = country;
        phoneNumberWithoutCode = fullPhoneNumber.substring(country.code.length);
        break;
      }
    }

    return {
      phoneNumber: phoneNumberWithoutCode,
      selectedCountry: matchedCountry,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching phone from database:", error);
    return {
      phoneNumber: "",
      selectedCountry: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Synchronize phone data between local storage and database
 * This function prioritizes DB values over local storage
 */
export const syncPhoneData = async (): Promise<{
  phoneNumber: string;
  selectedCountry: CountryCode;
  isDataSaved: boolean;
}> => {
  // Try to get data from database first
  const dbResult = await fetchUserPhoneFromDB();

  if (dbResult.success && dbResult.phoneNumber && dbResult.selectedCountry) {
    // We have data in the database, save it to local storage
    await AsyncStorage.setItem(PHONE_NUMBER_KEY, dbResult.phoneNumber);
    await AsyncStorage.setItem(
      SELECTED_COUNTRY_KEY,
      dbResult.selectedCountry.code
    );

    return {
      phoneNumber: dbResult.phoneNumber,
      selectedCountry: dbResult.selectedCountry,
      isDataSaved: true,
    };
  }

  // If no data in DB or error occurred, try local storage
  const localData = await loadPhoneData();

  return {
    phoneNumber: localData.phoneNumber,
    selectedCountry: localData.selectedCountry,
    isDataSaved: localData.isLoaded,
  };
};
