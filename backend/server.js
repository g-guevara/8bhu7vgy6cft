require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

// FUNCIÓN SERVERLESS
// Connection pooling implementation
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // Connection options optimized for serverless
  const options = {
    dbName: "sensitivv",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Adjust based on your needs
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  };

  // Connect to the database
  const client = await mongoose.connect(process.env.MONGODB_URI, options);
  console.log("Connected to MongoDB");
  
  cachedDb = client;
  return client;
}

const app = express();
// Configuración detallada de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'User-ID'],  // Changed from Authorization to User-ID
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connection status check middleware
app.use(async (req, res, next) => {
  // Skip connection check for non-DB routes
  if (req.path === '/' || req.path === '/health') {
    return next();
  }
  
  try {
    // Check if we're connected, reconnect if needed
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, reconnecting...");
      await connectToDatabase();
    }
    next();
  } catch (error) {
    console.error("Database connection error in middleware:", error);
    return res.status(500).json({ error: "Database connection error" });
  }
});

// Initialize database connection
connectToDatabase()
  .then(() => console.log("Database connection ready"))
  .catch(err => console.error("MongoDB connection error:", err));

// Connection error handling
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  connectToDatabase();
});

// Schemas

// User Schema
const UserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  language: { type: String, default: "en" },
  trialPeriodDays: { type: Number, default: 5 },
  googleId: { type: String, sparse: true },
  authProvider: { type: String, default: 'local' }
}, { timestamps: true });

// Articles Schema
const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String },
  category: { type: String },
  tags: [String],
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// History Schema
const HistorySchema = new mongoose.Schema({
  userID: { type: String, required: true },
  itemID: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Product Ingredients Schema
const ProductIngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  properties: { type: Object },
  safetyLevel: { type: String }
}, { timestamps: true });

// Product Notes Schema
const ProductNoteSchema = new mongoose.Schema({
  productID: { type: String, required: true },
  userID: { type: String, required: true },
  note: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

// Wishlist Schema
const WishlistSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  productID: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const TestSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  itemID: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  finishDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  result: { type: String, enum: ['Critic', 'Sensitive', 'Safe', null], default: null }
}, { timestamps: true });

// Product Reaction Schema
const ProductReactionSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  productID: { type: String, required: true },
  reaction: { type: String, enum: ['Critic', 'Sensitive', 'Safe'], required: true }
}, { timestamps: true });

// Ingredient Reaction Schema
const IngredientReactionSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  ingredientName: { type: String, required: true },
  reaction: { type: String, enum: ['Critic', 'Sensitive', 'Safe'], required: true }
}, { timestamps: true });

// Modelos
const User = mongoose.model("User", UserSchema, "user");
const Article = mongoose.model("Article", ArticleSchema, "articles");
const History = mongoose.model("History", HistorySchema, "history");
const ProductIngredient = mongoose.model("ProductIngredient", ProductIngredientSchema, "productingredients");
const ProductNote = mongoose.model("ProductNote", ProductNoteSchema, "productnotes");
const Wishlist = mongoose.model("Wishlist", WishlistSchema, "wishlist");
const Test = mongoose.model("Test", TestSchema, "tests");
const ProductReaction = mongoose.model("ProductReaction", ProductReactionSchema, "productreactions");
const IngredientReaction = mongoose.model("IngredientReaction", IngredientReactionSchema, "ingredientreactions");

// Simple ID-based Authentication Middleware
const authenticateUser = async (req, res, next) => {
  console.log('=========== AUTENTICACIÓN ===========');
  console.log('Headers recibidos:', JSON.stringify(req.headers));
  
  // Intentar obtener el ID de usuario de diferentes formas posibles
  const userId = req.headers['user-id'] || req.headers['User-ID'] || req.headers['userid'] || req.headers['userID'];
  
  console.log('User-ID encontrado:', userId || 'NO ENCONTRADO');
  
  if (!userId) {
    console.log('Error: No se proporcionó User-ID');
    return res.status(401).json({ error: "Authentication required - Missing User-ID" });
  }

  try {
    // Buscar usuario en la base de datos
    console.log('Buscando usuario con ID:', userId);
    const user = await User.findOne({ userID: userId });
    
    // Si no se encuentra por userID, intentar con _id
    if (!user) {
      console.log('Usuario no encontrado por userID, intentando por _id');
      const userById = await User.findOne({ _id: userId });
      
      if (userById) {
        console.log('Usuario encontrado por _id');
        req.user = {
          userID: userById._id.toString(), // Convertir ObjectId a string si es necesario
          email: userById.email,
          name: userById.name
        };
        return next();
      }
      
      console.log('Error: Usuario no encontrado');
      return res.status(403).json({ error: "Invalid user ID" });
    }
    
    // Si llegamos aquí, el usuario se encontró correctamente
    console.log('Usuario autenticado correctamente:', user.name);
    
    // Adjuntar información del usuario a la solicitud
    req.user = {
      userID: user.userID,
      email: user.email,
      name: user.name
    };
    
    console.log('=========== FIN AUTENTICACIÓN ===========');
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      error: "Authentication error", 
      details: error.message 
    });
  }
};

// RUTAS

// Health check endpoint
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  
  res.json({
    status: "ok",
    dbState: dbStateMap[dbState] || "unknown",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente 🚀" });
});

// Ruta de prueba para POST
app.post("/test", (req, res) => {
  console.log("Recibido POST en /test:", req.body);
  res.json({ 
    message: "POST recibido correctamente",
    body: req.body 
  });
});

// Rutas de Usuarios
app.get("/users", authenticateUser, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Excluir contraseñas
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REGISTRO DE USUARIO - VERSIÓN MEJORADA
app.post("/users", async (req, res) => {
  try {
    const { name, email, password, language } = req.body;
    
    // Validaciones de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: "MISSING_REQUIRED_FIELDS",
        message: "Todos los campos son requeridos"
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: "INVALID_EMAIL_FORMAT",
        message: "El formato del email no es válido"
      });
    }
    
    // Validar longitud de contraseña
    if (password.length < 8) {
      return res.status(400).json({ 
        error: "PASSWORD_TOO_SHORT",
        message: "La contraseña debe tener al menos 8 caracteres"
      });
    }
    
    // Verificar si el usuario ya existe - MENSAJE ESPECÍFICO
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        error: "EMAIL_ALREADY_EXISTS",
        message: "Este email ya está registrado. ¿Ya tienes una cuenta?"
      });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const user = new User({
      userID: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      language: language || "es"
    });
    
    await user.save();
    
    // Remover contraseña de la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: userResponse
    });
  } catch (error) {
    console.error("Error en registro:", error);
    
    // Manejo específico de errores de MongoDB
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "EMAIL_ALREADY_EXISTS",
        message: "Este email ya está registrado. ¿Ya tienes una cuenta?"
      });
    }
    
    // Error genérico del servidor
    res.status(500).json({ 
      error: "INTERNAL_SERVER_ERROR",
      message: "Error interno del servidor. Por favor, intenta más tarde."
    });
  }
});

// LOGIN DE USUARIO - VERSIÓN MEJORADA
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        error: "MISSING_CREDENTIALS",
        message: "Email y contraseña son requeridos"
      });
    }
    
    // Buscar usuario (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: "INVALID_CREDENTIALS",
        message: "Email o contraseña incorrectos"
      });
    }
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        error: "INVALID_CREDENTIALS",
        message: "Email o contraseña incorrectos"
      });
    }
    
    // Remover contraseña de la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ 
      message: "Login exitoso",
      user: userResponse
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ 
      error: "INTERNAL_SERVER_ERROR",
      message: "Error interno del servidor. Por favor, intenta más tarde."
    });
  }
});

// GOOGLE LOGIN - VERSIÓN MEJORADA
app.post("/google-login", async (req, res) => {
  try {
    const { email, name, googleId, idToken, accessToken } = req.body;
    
    if (!email || !name || !googleId) {
      return res.status(400).json({ 
        error: "MISSING_GOOGLE_DATA",
        message: "Datos de Google incompletos"
      });
    }
    
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Crear nuevo usuario con Google
      user = new User({
        userID: new mongoose.Types.ObjectId().toString(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: await bcrypt.hash(googleId + Date.now(), 10), // Contraseña temporal
        language: "es",
        googleId: googleId,
        authProvider: 'google'
      });
      await user.save();
    } else if (!user.googleId) {
      // Vincular cuenta existente con Google
      user.googleId = googleId;
      user.authProvider = 'google';
      await user.save();
    }
    
    // Remover contraseña de la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ 
      message: "Login con Google exitoso",
      user: userResponse
    });
  } catch (error) {
    console.error("Error en Google login:", error);
    res.status(500).json({ 
      error: "GOOGLE_LOGIN_ERROR",
      message: "Error al iniciar sesión con Google. Intenta más tarde."
    });
  }
});

// Rutas de Artículos (protegidas)
app.get("/articles", authenticateUser, async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/articles", authenticateUser, async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de Historia (protegidas)
app.get("/history", authenticateUser, async (req, res) => {
  try {
    const history = await History.find({ userID: req.user.userID });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/history", authenticateUser, async (req, res) => {
  try {
    const history = new History({
      ...req.body,
      userID: req.user.userID
    });
    await history.save();
    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de Ingredientes (protegidas)
app.get("/productingredients", authenticateUser, async (req, res) => {
  try {
    const ingredients = await ProductIngredient.find();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/productingredients", authenticateUser, async (req, res) => {
  try {
    const ingredient = new ProductIngredient(req.body);
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de Notas de Producto (protegidas)
app.get("/productnotes", authenticateUser, async (req, res) => {
  try {
    const notes = await ProductNote.find({ userID: req.user.userID });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/productnotes", authenticateUser, async (req, res) => {
  try {
    const note = new ProductNote({
      ...req.body,
      userID: req.user.userID
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de Wishlist (protegidas)
app.get("/wishlist", authenticateUser, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userID: req.user.userID });
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/wishlist", authenticateUser, async (req, res) => {
  try {
    const item = new Wishlist({
      ...req.body,
      userID: req.user.userID
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password endpoint
app.post("/change-password", authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findOne({ userID: req.user.userID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update trial period endpoint
app.post("/update-trial-period", authenticateUser, async (req, res) => {
  try {
    const { trialDays } = req.body;
    
    // Validate trial days
    if (typeof trialDays !== 'number' || trialDays < 0) {
      return res.status(400).json({ error: "Invalid trial days value" });
    }
    
    // Find user and update
    const user = await User.findOne({ userID: req.user.userID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.trialPeriodDays = trialDays;
    await user.save();
    
    res.json({ 
      message: "Trial period updated successfully",
      trialPeriodDays: trialDays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile endpoint
app.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userID }).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE wishlist item endpoint
app.delete("/wishlist/:id", authenticateUser, async (req, res) => {
  try {
    const wishlistItemId = req.params.id;
    
    // Find the wishlist item
    const wishlistItem = await Wishlist.findOne({ 
      _id: wishlistItemId,
      userID: req.user.userID // Ensure the item belongs to the authenticated user
    });
    
    if (!wishlistItem) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }
    
    // Delete the item
    await Wishlist.deleteOne({ _id: wishlistItemId });
    
    res.json({ 
      message: "Item removed from wishlist successfully",
      id: wishlistItemId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's active tests
app.get("/tests", authenticateUser, async (req, res) => {
  try {
    const tests = await Test.find({ userID: req.user.userID });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a new test
app.post("/tests", authenticateUser, async (req, res) => {
  try {
    const { itemID } = req.body;
    
    if (!itemID) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    
    // Check if there's already an active test for this product
    const existingTest = await Test.findOne({ 
      userID: req.user.userID,
      itemID,
      completed: false
    });
    
    if (existingTest) {
      return res.status(400).json({ error: "Test already in progress for this product" });
    }
    
    // Create a new test with 3-day duration
    const startDate = new Date();
    const finishDate = new Date(startDate);
    finishDate.setDate(finishDate.getDate() + 3); // 3-day test
    
    const test = new Test({
      userID: req.user.userID,
      itemID,
      startDate,
      finishDate,
      completed: false
    });
    
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete a test
app.put("/tests/:id", authenticateUser, async (req, res) => {
  try {
    const testId = req.params.id;
    const { result } = req.body;
    
    const test = await Test.findOne({ 
      _id: testId,
      userID: req.user.userID
    });
    
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }
    
    test.completed = true;
    if (result) {
      test.result = result;
    }
    
    await test.save();
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing product note
app.put("/productnotes/:id", authenticateUser, async (req, res) => {
  try {
    const noteId = req.params.id;
    const { note, rating } = req.body;
    
    // Find the note by ID and ensure it belongs to the authenticated user
    const existingNote = await ProductNote.findOne({ 
      _id: noteId,
      userID: req.user.userID 
    });
    
    if (!existingNote) {
      return res.status(404).json({ error: "Note not found or not authorized to update" });
    }
    
    // Update the note
    existingNote.note = note;
    if (rating !== undefined) {
      existingNote.rating = rating;
    }
    
    await existingNote.save();
    res.json(existingNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product reactions
app.get("/product-reactions", authenticateUser, async (req, res) => {
  try {
    const reactions = await ProductReaction.find({ userID: req.user.userID });
    res.json(reactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save product reaction
app.post("/product-reactions", authenticateUser, async (req, res) => {
  try {
    const { productID, reaction } = req.body;
    
    // Check if reaction already exists for this product
    let existingReaction = await ProductReaction.findOne({
      userID: req.user.userID,
      productID
    });
    
    if (existingReaction) {
      // Update existing reaction
      existingReaction.reaction = reaction;
      await existingReaction.save();
      res.json(existingReaction);
    } else {
      // Create new reaction
      const newReaction = new ProductReaction({
        userID: req.user.userID,
        productID,
        reaction
      });
      
      await newReaction.save();
      res.status(201).json(newReaction);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product reaction
app.delete("/product-reactions/:productID", authenticateUser, async (req, res) => {
  try {
    const { productID } = req.params;
    
    await ProductReaction.deleteOne({
      userID: req.user.userID,
      productID
    });
    
    res.json({ message: "Reaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save ingredient reaction
app.post("/ingredient-reactions", authenticateUser, async (req, res) => {
  try {
    const { ingredientName, reaction } = req.body;
    
    // Check if reaction already exists for this ingredient
    let existingReaction = await IngredientReaction.findOne({
      userID: req.user.userID,
      ingredientName
    });
    
    if (existingReaction) {
      // Update existing reaction
      existingReaction.reaction = reaction;
      await existingReaction.save();
      res.json(existingReaction);
    } else {
      // Create new reaction
      const newReaction = new IngredientReaction({
        userID: req.user.userID,
        ingredientName,
        reaction
      });
      
      await newReaction.save();
      res.status(201).json(newReaction);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ingredient reaction
app.delete("/ingredient-reactions/:ingredientName", authenticateUser, async (req, res) => {
  try {
    const { ingredientName } = req.params;
    
    await IngredientReaction.deleteOne({
      userID: req.user.userID,
      ingredientName
    });
    
    res.json({ message: "Ingredient reaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ingredient reactions
app.get("/ingredient-reactions", authenticateUser, async (req, res) => {
  console.log("[DEBUG] Received request for /ingredient-reactions");
  console.log("[DEBUG] User ID:", req.user.userID);
  
  try {
    // Find all ingredient reactions for this user
    const reactions = await IngredientReaction.find({ userID: req.user.userID });
    console.log("[DEBUG] Found ingredient reactions:", reactions.length);
    
    // Ensure we're sending JSON content type
    res.setHeader('Content-Type', 'application/json');
    res.json(reactions);
  } catch (error) {
    console.error("[ERROR] Failed to fetch ingredient reactions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify user (ruta de utilidad)
app.get("/verify-token", authenticateUser, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.get("/diagnostico", async (req, res) => {
  try {
    // Información del sistema
    const info = {
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      mongoConnection: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
    };
    
    // Contar documentos en colecciones principales
    const usuarios = await User.countDocuments();
    const tests = await Test.countDocuments();
    const wishlists = await Wishlist.countDocuments();
    
    // Información adicional
    const ultimosUsuarios = await User.find().sort({ createdAt: -1 }).limit(3).select('-password');
    
    // Devolver resultado
    res.json({
      info,
      contadores: {
        usuarios,
        tests,
        wishlists
      },
      ultimosUsuarios
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL - MEJORADO
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  
  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Los datos proporcionados no son válidos",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Error de duplicado en MongoDB
  if (err.code === 11000) {
    return res.status(409).json({
      error: "DUPLICATE_ENTRY",
      message: "Ya existe un registro con estos datos"
    });
  }
  
  // Error de conexión a la base de datos
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(503).json({
      error: "DATABASE_ERROR",
      message: "Problema temporal con la base de datos. Intenta más tarde."
    });
  }
  
  // Error genérico
  res.status(500).json({ 
    error: "INTERNAL_SERVER_ERROR",
    message: "Error interno del servidor. Por favor, intenta más tarde."
  });
});

// Middleware para asegurar que todas las respuestas sean JSON
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    if (typeof body === 'string' && !res.get('Content-Type')?.includes('json')) {
      res.set('Content-Type', 'application/json');
      body = JSON.stringify({ message: body });
    }
    return originalSend.call(this, body);
  };
  next();
});

// Exportar para Vercel
module.exports = app;

// Iniciar servidor si no está en Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log("✅ Mejoras de manejo de errores aplicadas");
  });
}