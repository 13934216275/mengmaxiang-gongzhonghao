const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')
const path = require('path')

console.info(process.env.NODE_ENV)

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: true,
  productionSourceMap: false, // 去掉打包后js中，会自动生成的一些map文件
  // app.all('*', function (req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  //   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  //   res.header("X-Powered-By", ' 3.2.1')
  //   res.header("Content-Type", "application/json;charset=utf-8");
  //   next();
  // }),
  devServer: {
    disableHostCheck: true,
    port: 8086, // 端口
    proxy: {
      '/api': {
        // target: 'https://shop.winbeitech.com',   // 生产服务器域名
        // target: 'https://ec.mauth.cn',   // 测试服务器域名
        // target: 'http://39.107.77.148:8085',       //服务器IP地址
        target: 'http://192.168.1.163:8085',      //李项
        // target: 'http://192.168.1.101:8085',      //赵志斌
        changeOrigin: true, // target是域名的话，需要这个参数，
        secure: false, // 设置支持https协议的代理
        pathRewrite: { '^/api': 'http://39.107.77.148:8085' }
      },
      '': {
        // target: 'https://shop.winbeitech.com',       // 生产服务器域名
        // target: 'https://ec.mauth.cn',                  // 测试服务器域名
          // target: 'http://39.107.77.148:8085',
        target: 'http://192.168.1.163:8085',
        // target: 'http://192.168.1.101:8085',
        changeOrigin: true, // target是域名的话，需要这个参数，
        secure: false, // 设置支持https协议的代理
        pathRewrite: { '': 'http://39.107.77.148:8085' }
      }
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@styles', resolve('src/styles'))
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          autoprefixer({
            browsers: ['Android >= 4.0', 'iOS >= 7']
          }),
          pxtorem({
            rootValue: 50,
            unitPrecision: 3,
            propList: ['*', '!font*'],
            selectorBlackList: ['.ignore ', '.hairlines', 'van-circle__layer', '.van-hairline'],
            minPixelValue: 2
          })
        ]
      }
    }
  }
}
