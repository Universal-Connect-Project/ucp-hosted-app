import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
  entry: "./src/index.tsx",
  devServer: {
    historyApiFallback: true,
    port: 3000,
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(path.dirname(""), "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          { loader: "css-loader", options: { esModule: false, modules: true } },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
