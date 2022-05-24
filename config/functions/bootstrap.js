"use strict";
const moment = require("moment");
const sha1 = require("sha1");
const { findReport, createReport } = require("./utils/database");
module.exports = () => {
  var io = require("socket.io")(strapi.server, {
    cors: {
      origin: ["http://localhost:3000", "https://fhdk.gg"],
      methods: ["GET", "POST"],
      allowedHeaders: "*",
      credentials: true,
    },
  });

  io.on("connection", function (socket) {
    let socketServer = "";
    socket.on("join", async ({ server }) => {
      socket.join(server);
      socketServer = server;
    });
    socket.on("report", async (data, callback) => {
      if (socketServer.length > 0) {
        io.to(socketServer).emit("new_report", data);
      }
    });
    // socket.on("disconnect", () => {
    //   console.log(`\n\n\n\n끊어졌다\n\n\n`);
    // });
  });
};
