<template>
  <div class="container pd50">
    <!--轮播图-->
    <van-swipe :autoplay="3000" indicator-color="white" class="home-swiper">
      <van-swipe-item v-for="item in banner" :key="item.id">
        <img :src="item.pic" :alt="item.url" @click="jumpEvent(item.url)" />
      </van-swipe-item>
    </van-swipe>
    <!--商品列表-->
    <div class="main">
      <!--<van-loading size="24px" >加载中...</van-loading>-->
      <div class="section-header common-h2"><span class="common-h2-title">商品列表</span></div>
      <div class="list">
        <van-row>
          <van-col span="12" v-for="item in list" :key="item.id">
            <div class="list-item" @click="onDetailClick(item.id)">
              <div class="list-item-tag" v-if="item.recommendStatus">推荐</div>
              <img class="list-item-img" :src="item.pic" :alt="item.name">
              <div class="list-item-hd van-ellipsis">{{item.name}}</div>
              <div class="list-item-bd" style="float: left">
                <span class="ui-c-red">
                  ￥{{item.originalPrice}}
                </span>
                <span class="ui-c-red" v-if="item.price && item.price>item.originalPrice">
                  -{{item.price}}
                </span>
                <del v-if="item.promotionPrice" style="padding-left: 15px;color: #999999">￥{{item.promotionPrice}}</del>
              </div>
            </div>
          </van-col>
        </van-row>
      </div>
    </div>
    <!-- 底部导航栏 -->
    <van-tabbar route
      v-model="active"
      active-color="#f44">
      <van-tabbar-item replace
        to="/index/"
        icon="home-o">
        首页
      </van-tabbar-item>
      <van-tabbar-item replace
                       to="/category"
                       icon="qr">
        分类
      </van-tabbar-item>
      <van-tabbar-item replace
        to="/user"
        icon="manager-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
    <!--自动刷新华夏url-->
    <a id='links' href="#" style='display:none;'></a>
  </div>
</template>
<script>
import { Tabbar, TabbarItem, Swipe, SwipeItem, Loading  } from 'vant'
import util from '@/common/util'
export default {
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    [Swipe.name]: Swipe,
    [Loading .name]: Loading ,
    [SwipeItem.name]: SwipeItem
  },
  data() {
    return {
      wxgzh:'',  // 微信授权的url
      active: 0,  // 底部导航的默认选中值
      banner: [], // 轮播图列表
      list: []   // 商品列表
    }
  },
  created() {
    // this.fff()
      this.getBannerList()
      this.getGoodsList()
  },
  methods: {
   // 点击图片跳转
      jumpEvent(url){
          window.location.href = url
      },
    // 每次进入首页清空token
    eliminate(){
      util.storage.remove('token')
      util.storage.remove('sourceType')
    },
    // 判断进入首页的渠道
    fff(){
      var resualt = new Object()
      resualt = this.getSearchString(window.location.search)
      if(resualt["wx"] == 'winbei'){
        this.wxwinbei()
      }else if (resualt["token"]!=null && resualt["token"]!=''){
        this.hxurl()
      }else{
        this.getBannerList()
        this.getGoodsList()
      }
    },
    // 截取华夏带的数据
    hxurl(){
      this.eliminate()
      var resualt = new Object()
      resualt = this.getSearchString(window.location.search)
        util.storage.set('token',resualt["token"])
        util.storage.set('sourceType',resualt["channel"])
      this.getBannerList()
      this.getGoodsList()
    },
    // 获取微信授权的url
    wxwinbei(){
      this.$request.get('/weChat/public/login',).then(res => {
        this.wxgzh = res.data
        this.gzh()
      })
    },
    // 自动请求华夏url
    gzh(){
      var obj = document.getElementById('links')
      obj.href = this.wxgzh
      obj.click()
    },
    // 截取路由参数
    getSearchString(Url) {
      var str = Url
      str = str.substring(1, str.length)
      var arr = str.split("&")
      var obj = new Object()
      for (var i = 0; i < arr.length; i++) {
        var tmp_arr = arr[i].split("=")
        obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1])
      }
      return obj
    },
    // 获取商品列表
    getGoodsList() {
      this.$request.get('/home/recommendProductList').then(res => {
        this.list = res.data || []
      })
    },
    // 获取轮播图图片列表
    getBannerList() {
      this.$request.get('/home/banner', { type: 'indexBanner' }).then(res => {
        this.banner = res.data
      })
    },
    // 点击商品去到详情页
    onDetailClick(id) {
      this.$router.push({ path: '/goods-detail', query: { id }})
    },
    // 其他
    onSearch() { },
    onCancel() { }
  }
}
</script>
<style lang="less" scoped>
.home-swiper,.home-swiper img {
  width: 100%;
  height: 188px;
}
.common-h2 {
  background: none;
}
.list {
  padding-left: 5px;
  padding-right: 5px;
  .van-col {
    box-sizing: border-box;
    padding-left: 5px;
    padding-right: 5px;
    margin-bottom: 10px;
  }

  &-item {
    position:relative;
    text-align: left;
    overflow: hidden;
    background: #fff;
    // border-radius: 8px;
    // box-shadow: 0px 2px 4px 3px rgba(243, 243, 243, 0.5);
  &-tag {
    position: absolute;
    top: 15px;
    left: 0;
    background-color: #f44;
    display: inline-block;
    padding: 0.2em 0.5em;
    color: #fff;
    font-size: 10px;
    line-height: normal;
    border-radius: 0 0.8em 0.8em 0;
    padding-right: 0.6em;
  }
  &-img {
    display: block;
    width: 100%;
    height: 160px;
  }
  &-hd {
    padding: 10px 10px 0;
    font-size: 14px;
    color: #333;
    font-size: 14px;
    // margin-bottom: 5px;
  }
  &-ft{
        padding: 10px 10px;
    display: block;
    font-size: 14px;
  }
  &-bd {
    padding: 10px 10px;
    display: block;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
  }
  }
  &-item:nth-child(even) {
    // margin-left:
  }

}
</style>
