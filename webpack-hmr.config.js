const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const path = require('path');

module.exports = function (options, webpack) {
  const entryFile = 'main.hmr';

  return {
    ...options,
    entry: ['webpack/hot/poll?100', `./src/${entryFile}.ts`],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: `${entryFile}.js`,
        autoRestart: false,
      }),
    ],
    output: {
      path: path.join(__dirname, 'dist'),
      filename: `${entryFile}.js`,
    },
  };
};
