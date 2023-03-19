const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = 3005;

app.use(morgan("combined"));

app.use(
  "/bookingservice",
  createProxyMiddleware({
    target: "http://127.0.0.1:3002/",
    changeOrigin: true,
  })
);

app.get("/home", (req, res) => {
  return res.json({
    message: "OKAY",
  });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
