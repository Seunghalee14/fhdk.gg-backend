module.exports = {
  apps: [
    {
      name: 'fhdk',
      script: 'npm',
      args: 'start',
      autorestart: true,
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
