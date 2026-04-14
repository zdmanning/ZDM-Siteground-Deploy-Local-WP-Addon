const path = require('path');
const nodeExternals = require('webpack-node-externals');

// ─── Build mode ────────────────────────────────────────────────────────────────
// Pass --env mode=production for a minified, source-map-free distribution build.
// Default is 'development' (faster rebuilds, .js.map files included).
module.exports = (env = {}) => {
  const mode    = env.mode || 'development';
  const devtool = mode === 'production' ? false : 'source-map';

  // ─── Shared Babel loader ─────────────────────────────────────────────────────
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

  // ─── Main process bundle ─────────────────────────────────────────────────────
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
    mode,
    devtool,
  };

  // ─── Renderer process bundle ─────────────────────────────────────────────────
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
    mode,
    devtool,
  };

  return [mainConfig, rendererConfig];
};
