import * as Contacts from "expo-contacts";
import * as Sharing from "expo-sharing";
import { Alert, Linking, Platform } from "react-native";

/**
 * Request permissions and load contacts
 * @returns {Promise<Array>} Array of contacts with phone numbers
 */
export const loadContactsData = async () => {
  try {
    // Request permission to access contacts
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      // Fetch contacts if permission granted
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.Image,
        ],
      });

      if (data.length > 0) {
        // Filter contacts to only include those with phone numbers
        return data.filter(
          (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
        );
      }
      return [];
    } else {
      Alert.alert(
        "Permission Required",
        "nocap needs access to your contacts to help you connect with friends.",
        [{ text: "OK" }]
      );
      return [];
    }
  } catch (error) {
    console.error("Error loading contacts:", error);
    Alert.alert("Error", "Something went wrong while loading your contacts.", [
      { text: "OK" },
    ]);
    return [];
  }
};

/**
 * Send invitation to a contact via WhatsApp, SMS, or Share dialog
 * @param {Object} contact - Contact object with name and phone number
 */
export const inviteContact = async (contact) => {
  if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) return;

  const phoneNumber = contact.phoneNumbers[0].number;
  const contactName = contact.name || "Friend";
  const appName = "nocap";
  const message = `Hey ${contactName}! I’m on NoCap — it’s like a private peek into my daily life, just for my close 20. Join in and share yours too: https://nocap.app/download`;

  // Option 1: Try WhatsApp
  try {
    // Format phone number (remove non-numeric characters)
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(
      message
    )}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);

    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return;
    }
  } catch (error) {
    console.log("WhatsApp not available, falling back to SMS");
  }

  // Option 2: Try to open the default SMS app
  try {
    const smsUrl =
      Platform.OS === "ios"
        ? `sms:${phoneNumber}&body=${encodeURIComponent(message)}`
        : `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

    const canOpen = await Linking.canOpenURL(smsUrl);

    if (canOpen) {
      await Linking.openURL(smsUrl);
      return;
    }
  } catch (error) {
    console.log("SMS not available, falling back to share dialog");
  }

  // Option 3: Last resort - use the share dialog
  try {
    const isShareAvailable = await Sharing.isAvailableAsync();
    if (isShareAvailable) {
      await Sharing.shareAsync("", {
        dialogTitle: `Invite to ${appName}`,
        message: message,
      });
    } else {
      Alert.alert(
        "Error",
        "No messaging or sharing options available on this device.",
        [{ text: "OK" }]
      );
    }
  } catch (error) {
    console.error("Error sharing invitation:", error);
    Alert.alert("Error", "Could not send the invitation. Please try again.", [
      { text: "OK" },
    ]);
  }
};
