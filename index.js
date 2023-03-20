// Import required libraries
const express = require("express"); // Express.js web framework
const morgan = require("morgan"); // HTTP request logger middleware
const { createProxyMiddleware } = require("http-proxy-middleware"); // HTTP proxy middleware
const rateLimit = require("express-rate-limit"); // Request rate limiting middleware
const axios = require("axios"); // HTTP client for making requests to other servers

// Create an instance of the Express.js application
const app = express();

// Define the port on which the application will listen
const PORT = 3005;

// Create an instance of the rate limiter middleware, which limits incoming requests to a maximum of 5 requests per 2 minutes
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // Maximum of 5 requests per 2 minutes
});

// Add middleware functions to the application
app.use(morgan("combined")); // Log incoming HTTP requests using the 'morgan' middleware
app.use(limiter); // Apply the rate limiter to all incoming requests

// Add a middleware function to authenticate requests to the '/bookingservice' path
app.use("/bookingservice", async (req, res, next) => {
  console.log(req.headers["x-access-token"]); // Log the 'x-access-token' header from the incoming request

  try {
    // Make a request to a local server running on port 3001 to check if the request is authenticated
    const response = await axios.get(
      "http://127.0.0.1:3001/api/v1/isauthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"], // Pass the 'x-access-token' header from the original request
        },
      }
    );

    console.log(response.data); // Log the response data from the server

    // If the response indicates that the request is authenticated, call the next middleware in the chain
    if (response.data.success) {
      next();
    } else {
      // If the response indicates that the request is not authenticated, return a 401 error response indicating that the request is unauthorized
      return res.status(401).json({
        message: "Unauthorised",
      });
    }
  } catch (error) {
    // If an error occurs while making the request to the local server, return a 401 error response indicating that the request is unauthorized
    return res.status(401).json({
      message: "Unauthorised",
    });
  }
});

// Add a middleware function to proxy requests to the '/bookingservice' path to another server running on port 3002
app.use(
  "/bookingservice",
  createProxyMiddleware({
    target: "http://127.0.0.1:3002/",
    changeOrigin: true,
  })
);

// Define a route handler to respond to requests to the '/home' path with a JSON response of {message: 'OK'}
app.get("/home", (req, res) => {
  return res.json({ message: "OK" });
});

// Start the application and listen for incoming HTTP requests on the specified port
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
