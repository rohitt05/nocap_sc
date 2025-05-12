import { useState, useEffect } from "react";
import { supabase } from "../../../../../../lib/supabase"; // Adjust path as needed
import { Alert } from "react-native";

// Define types
interface UsePhoneNumberProps {
  initialPhoneNumber?: string;
}

interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
}

// Sample list of country codes - you may want to load this from a more complete source
const countryCodes: CountryCode[] = [
  { code: "US", name: "United States", dial_code: "+1" },
  { code: "GB", name: "United Kingdom", dial_code: "+44" },
  { code: "IN", name: "India", dial_code: "+91" },
  { code: "CA", name: "Canada", dial_code: "+1" },
  { code: "AU", name: "Australia", dial_code: "+61" },
  { code: "DE", name: "Germany", dial_code: "+49" },
  { code: "FR", name: "France", dial_code: "+33" },
  { code: "JP", name: "Japan", dial_code: "+81" },
  { code: "CN", name: "China", dial_code: "+86" },
  { code: "BR", name: "Brazil", dial_code: "+55" },
  // Add more country codes as needed
];

export const usePhoneNumber = ({
  initialPhoneNumber = "",
}: UsePhoneNumberProps = {}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(
    countryCodes[2]
  );
  const [loading, setLoading] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // Parse initial phone number if provided
  useEffect(() => {
    if (initialPhoneNumber) {
      // Try to parse the initial phone number to separate country code and number
      const matchedCountry = countryCodes.find((country) =>
        initialPhoneNumber.startsWith(country.dial_code)
      );

      if (matchedCountry) {
        setSelectedCountryCode(matchedCountry);
        setPhoneNumber(
          initialPhoneNumber.substring(matchedCountry.dial_code.length).trim()
        );
      } else {
        setPhoneNumber(initialPhoneNumber);
      }

      setUserPhone(initialPhoneNumber);
    }
  }, [initialPhoneNumber]);

  // Function to validate phone number format
  const validatePhoneNumber = (number: string): boolean => {
    // Simple validation - can be enhanced based on requirements
    return /^\d{5,15}$/.test(number.replace(/\s/g, ""));
  };

  // Function to format the full phone number with country code
  const formatFullPhoneNumber = (): string => {
    return `${selectedCountryCode.dial_code}${phoneNumber}`;
  };

  // Function to submit phone number to Supabase
  const submitPhoneNumber = async (): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      // Validate phone number
      if (!validatePhoneNumber(phoneNumber)) {
        setError("Please enter a valid phone number");
        return false;
      }

      const formattedPhone = formatFullPhoneNumber();
      setUserPhone(formattedPhone);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("User not authenticated");
        return false;
      }

      // Update the user's phone number in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ phone: formattedPhone })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating phone number:", updateError);
        setError("Failed to update phone number. Please try again.");
        return false;
      }

      Alert.alert("Success", "Phone number updated successfully!");
      return true;
    } catch (err) {
      console.error("Error in phone number submission:", err);
      setError("An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle country selector
  const toggleCountrySelector = () => {
    setShowCountrySelector(!showCountrySelector);
  };

  // Function to select a country code
  const selectCountryCode = (country: CountryCode) => {
    setSelectedCountryCode(country);
    setShowCountrySelector(false);
  };

  return {
    phoneNumber,
    setPhoneNumber,
    selectedCountryCode,
    countryCodes,
    showCountrySelector,
    toggleCountrySelector,
    selectCountryCode,
    loading,
    error,
    userPhone,
    submitPhoneNumber,
    formatFullPhoneNumber,
  };
};

export default usePhoneNumber;
