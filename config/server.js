module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "98c47a6f206b345bce5a3b281575b689"),
    },
  },
  cron: {
    enabled: true,
  },
});
