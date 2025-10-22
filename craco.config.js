module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.(wav)$/i,
            type: 'asset/resource',
          },
        ],
      },
    },
  },
}; 