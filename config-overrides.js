const {
  override,
  // ...
  addWebpackAlias,
  addWebpackPlugin,
  fixBabelImports,
  overrideDevServer,
  // ...
} = require('customize-cra')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const {
  BundleAnalyzerPlugin
} = require('webpack-bundle-analyzer');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const addLessLoader = require('customize-cra-less-loader')
// 打包配置
const addCustomize = () => config => {
  if (process.env.NODE_ENV === 'production') {
    // 关闭sourceMap
    config.devtool = false;
    // 配置打包后的文件位置
    config.output.path = __dirname + '../dist';
    config.output.publicPath = './dist/static';
    // 添加js打包gzip配置
    config.plugins.push(
      new CompressionWebpackPlugin({
        test: /\.js$|\.css$/,
        threshold: 1024,
      }),
    )
  }
  const index = config.resolve.plugins.find((plugin) => plugin.constructor.name === `ModuleScopePlugin`)
    if (index) {
      config.resolve.plugins.splice(index, 1)
    }
  return config;
}
// 跨域配置
const devServerConfig = () => config => {
  console.log('process.env.REACT_APP_PROXY_URL:', process.env.REACT_APP_PROXY_URL)
  return {
    ...config,
    // 服务开启gzip
    compress: true,
    proxy: {
      '/api': {
        target: process.env.REACT_APP_PROXY_URL,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/',
        },
      }
    }
  }
}

module.exports = {
  webpack: override(
    // ...
    // 路径别名

    // addWebpackAlias({
    //   // '@': path.resolve(__dirname, '..', 'src'),
    // }),

    //antd按需加在

    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: 'css',
    }),

    //less
    addLessLoader({
      lessOptions: {
        javascriptEnabled: true,
        // Optionally adjust URLs to be relative. When false, URLs are already relative to the entry less file.
        relativeUrls: false,
        modifyVars: {
          // '@primary-color': '#A80000'
        },
        cssModules: {
          // if you use CSS Modules, and custom `localIdentName`, default is '[local]--[hash:base64:5]'.
          localIdentName: "[path][name]__[local]--[hash:base64:5]",
        }
      }
    }),

    addCustomize(),

    //查看打包体积
    process.env.ANALYZER && addWebpackPlugin(new BundleAnalyzerPlugin()),

    //生产环境去除console.log、debugger；
    process.env.NODE_ENV === 'production' && addWebpackPlugin(
      new UglifyJsPlugin({
        // 开启打包缓存
        cache: true,
        // 开启多线程打包
        parallel: true,
        uglifyOptions: {
          // 删除警告
          warnings: false,
          // 压缩
          compress: {
            // 移除console
            drop_console: true,
            // 移除debugger
            drop_debugger: true
          }
        }
      })
    )
    // ...
  ),
  //代理
  devServer: overrideDevServer(
    devServerConfig()
  )
}
