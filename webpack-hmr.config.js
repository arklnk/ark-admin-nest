const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const path = require('path');

module.exports = function (options, webpack) {
  const entryFile = 'main.hmr';
  const allowlist = ['webpack/hot/poll?100'];

  return {
    ...options,
    entry: [...allowlist, `./src/${entryFile}.ts`],
    externals: [nodeExternals({ allowlist })],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: `${entryFile}.js`,
        autoRestart: true,
      }),
    ],
    output: {
      path: path.join(__dirname, 'dist'),
      filename: `${entryFile}.js`,
    },
  };
};
