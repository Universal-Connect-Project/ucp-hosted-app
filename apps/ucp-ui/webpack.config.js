import Dotenv from "dotenv-webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";

export default ({ production }) => {
  const environmentString = production ? "production" : "staging";

  return {
    entry: "./src/index.tsx",
    devServer: {
      historyApiFallback: true,
      port: process.env.port || 3000,
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
          exclude: /node_modules\/(?!@repo\/)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
            },
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: ["file-loader"],
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
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
      new MiniCssExtractPlugin(),
      new CopyWebpackPlugin({
        patterns: ["assets"],
      }),
    ],
  };
};
