const path = require('path');
const nodeExternals = require('webpack-node-externals');

// ─── Shared Babel loader ───────────────────────────────────────────────────────
const babelRule = {
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', { targets: { electron: '28' } }],
        '@babel/preset-react',
      ],
    },
  },
};

// ─── Main process bundle ───────────────────────────────────────────────────────
// Node externals: do NOT bundle anything from node_modules.
// Those packages live in the add-on's own node_modules/ at runtime.
const mainConfig = {
  name: 'main',
  target: 'electron-main',
  entry: './src/main/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'main.js',
    libraryTarget: 'commonjs2',
  },
  externals: [nodeExternals()],
  module: {
    rules: [babelRule],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  mode: 'development',
  devtool: 'source-map',
};

// ─── Renderer process bundle ───────────────────────────────────────────────────
// React and react-dom are provided by Local at runtime — mark as external.
// Everything else (CSS, our own components) is bundled in.
const rendererConfig = {
  name: 'renderer',
  target: 'electron-renderer',
  entry: './src/renderer/index.jsx',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'renderer.js',
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
    'react-router-dom': 'commonjs react-router-dom',
    electron: 'commonjs electron',
  },
  module: {
    rules: [
      babelRule,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  mode: 'development',
  devtool: 'source-map',
};

module.exports = [mainConfig, rendererConfig];
