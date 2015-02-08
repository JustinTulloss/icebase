module.exports = {
    entry: {
      app: "./src/club.js",
    },
    output: {
        path: './build',
        filename: "package.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.js$/, exclude: /node_modules/, loader: '6to5-loader'}
        ]
    }
};
