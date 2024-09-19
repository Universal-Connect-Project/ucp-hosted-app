import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Dotenv from "dotenv-webpack";

export default ({ production }) => {
  const environmentString = production ? "production" : "staging";

  return {
    entry: "./src/index.tsx",
    devServer: {
      historyApiFallback: true,
      port: 3000,
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(path.dirname(""), "dist"),
      publicPath: "/",
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
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: ["file-loader"],
        },
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { esModule: false, modules: true },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new Dotenv({
        path: `./env/${environmentString}.env`,
      }),
    ],
  };
};
