module.exports = ({ env }) => ({
  settings: {
    cors: {
      origin: [
        "http://localhost:1337",
        "http://localhost:3000",
        "http://localhost:5000",
        "https://api.fhdk.gg",
        "https://fhdk.gg",
      ],
    },
  },
});
