// app/styles/SignupFormStyles.ts
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Define a type for your styles
interface SignupFormStylesType {
  formContainer: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  title: TextStyle;
  input: TextStyle;
  languageContainer: ViewStyle;
  languageLabel: TextStyle;
  languageButtons: ViewStyle;
  languageButton: ViewStyle;
  languageButtonActive: ViewStyle;
  languageButtonText: TextStyle;
  languageButtonTextActive: TextStyle;
  button: ViewStyle;
  buttonDisabled: ViewStyle;
  buttonText: TextStyle;
  switchButton: ViewStyle;
  switchButtonText: TextStyle;
  passwordStrengthContainer: ViewStyle;
  passwordStrengthBar: ViewStyle;
  passwordStrengthProgress: ViewStyle;
  passwordStrengthLabel: TextStyle;
  passwordRequirements: ViewStyle;
  requirementText: TextStyle;
  requirementMet: TextStyle;
  requirementNotMet: TextStyle;
}

export const styles = StyleSheet.create<SignupFormStylesType>({

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    width: '100%',
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#007bff",
    fontSize: 14,
  },
  languageContainer: {
    marginBottom: 15,
  },
  languageLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  languageButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  languageButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  languageButtonText: {
    color: "#333",
  },
  languageButtonTextActive: {
    color: "#fff",
  },

  formContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,

    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: -40,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  passwordStrengthContainer: {
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  passwordStrengthBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  passwordStrengthProgress: {
    height: '100%',
    borderRadius: 3,
    // Note: width and backgroundColor are set dynamically in the component
  },
  passwordStrengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  passwordRequirements: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  requirementText: {
    fontSize: 12,
    marginBottom: 4,
  },
  requirementMet: {
    color: '#27ae60',
  },
  requirementNotMet: {
    color: '#666',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 12,
  },
  showPasswordText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  passwordMatchText: {
    fontSize: 12,
    marginBottom: 16,
    marginTop: -8,
    paddingHorizontal: 10,
  },
  passwordMatch: {
    color: '#27ae60',  // Green
  },
  passwordNoMatch: {
    color: '#e74c3c',  // Red
  },
  


});