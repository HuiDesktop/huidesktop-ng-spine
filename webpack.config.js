const process = require('process')
const path = require('path')
const webpack = require('webpack')

const conf = {
  entry: { main: './src/index.ts', setup: './src/downloaderIndex.ts', editor: './src/editorIndex.ts' },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/Root')
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'awesome-typescript-loader',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new webpack.ProvidePlugin({ PIXI: 'pixi.js' })
  ],
  devtool: 'inline-source-map'
}

console.log(process.env.BUILD_LEVEL)
if (process.env.BUILD_LEVEL === 'development') conf.devtool = 'inline-source-map'

module.exports = conf
