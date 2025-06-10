export const GOOGLE_OAUTH_CONFIG = {
  web: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    projectId: process.env.GOOGLE_PROJECT_ID!,
    authUri: process.env.GOOGLE_AUTH_URI!,
    tokenUri: process.env.GOOGLE_TOKEN_URI!,
    authProviderX509CertUrl: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    javascriptOrigins: [process.env.GOOGLE_JAVASCRIPT_ORIGINS!]
  },
  // Configuración para diferentes plataformas
  ios: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
  },
  android: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
  }
};

// Cliente ID principal para expo-auth-session
export const GOOGLE_CLIENT_ID = GOOGLE_OAUTH_CONFIG.web.clientId;

// Opcional: Validación de variables de entorno
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_PROJECT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_AUTH_URI',
  'GOOGLE_TOKEN_URI',
  'GOOGLE_AUTH_PROVIDER_CERT_URL',
  'GOOGLE_JAVASCRIPT_ORIGINS'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida no encontrada: ${envVar}`);
  }
});
