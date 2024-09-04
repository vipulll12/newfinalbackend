const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { dbConnect } = require("./config/dbconnection");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

// Import routes

const adminRoutes = require("./routes/adminRoute");
const imageRoute = require("./routes/imageRoute");
const contactRoute = require("./routes/contactRoute");
const serviceCardRoute = require("./routes/serviceCardRoute");
const fileRoutes = require("./routes/fileRoute");
const userRoutes = require("./routes/userRoute");
const editorRoutes = require("./routes/editorRoutes");

app.use(cors());
app.use(bodyParser.json({ limit: "200mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://api.renderease.com/user/auth/google/callback", // Adjust this URL as needed
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    res.send({
      message: "File uploaded successfully",
      fileUrl: req.file.location,
    });
  } else {
    res.status(400).send("No file uploaded");
  }
});

// Use routes
app.use("/files", fileRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/images", imageRoute);
app.use("/editor", editorRoutes);

const startServer = async () => {
  try {
    await dbConnect();
    app.listen(process.env.PORT, () => {
      console.log(`Your server is running on port: ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();
