// app/styles/LoginFormStyles.ts - Updated with Google OAuth styles
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
    borderColor: "#e0e0e0",
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
  googleButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: "#555",
    fontWeight: "500",
    fontSize: 16,
  },
  googleButtonDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  googleButtonTextDisabled: {
    color: "#999",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#007bff",
    fontSize: 14,
  },
  switchButtonTextDisabled: {
    color: "#999",
  },
  forgotPasswordText: {
    color: "#007bff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  forgotPasswordTextDisabled: {
    color: "#999",
  },
  forgotPasswordButton: {
    marginTop: 10,
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
  
  // =============== PASSWORD TOGGLE STYLES ===============
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  showPasswordButton: {
    paddingRight: 15,
    paddingLeft: 10,
    paddingVertical: 15,
  },
  showPasswordText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
  showPasswordTextDisabled: {
    color: '#999',
  },
  
  // =============== SECURITY WARNING STYLES ===============
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});