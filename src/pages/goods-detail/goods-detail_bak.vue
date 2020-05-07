  <template>
  <div class="contaienr pd50">
<!--      商品图片显示-->
    <van-swipe :autoplay="3000" indicator-color="white" class="goods-swiper">
      <van-swipe-item v-for="item in banner" :key="item.id">
        <img :src="item.pic"/>
      </van-swipe-item>
    </van-swipe>
<!--      商品内容的展示-->
      <div class="goods-desc mb10" v-for="item in banner" :key="item.name">
          <div class="goods-desc-hd" >
              <span class="goods-desc-name">{{item.name}}</span>
<!--              <div class="btn-fav" v-if="hasFav" @click="onFavDelete($route.query.id)">已收藏</div>-->
<!--              <div class="btn-fav btn-fav-danger"  v-else @click="onFavAdd($route.query.id)">收藏</div>-->
          </div>
          <div class="goods-desc-brief">{{item.subTitle}}</div>
          <div class="goods-desc-price">
              <span class="goods-desc-price_min">
                  ￥{{item.originalPrice}}
              </span>
              <span class="goods-desc-price_min" v-if="item.price && item.price>item.originalPrice">
                  -{{item.price}}
              </span>
              <span class="goods-desc-price_label" v-if="marketing.type">{{marketing.info.label}}</span></div>
          <div class="goods-desc-price_original mb10" v-if="item.promotionPrice">￥{{item.promotionPrice}}</div>
          <div class="goods-desc-more van-hairline--top">
              <div class="goods-desc-more-item" >
                  <template v-if="basicInfo.logisticsId">
                      运费 {{logistics.isFree ? '免运费' : '不包邮'}}
                  </template>
                  <template v-else>
                     包邮
                  </template>
              </div>
              <!-- <div class="goods-desc-more-item ui-center">购买：{{basicInfo.numberSells}}</div> -->
              <div class="goods-desc-more-item ui-right" v-for="item in banner" :key="item.id">剩余{{item.stock}}{{item.unit}}</div>
          </div>
      </div>
<!--      用户评价-->
      <template>
          <van-cell class="mb10" title="暂无评价" />
      </template>
<!--      商品具体内容-->
      <div class="goods-h2 common-h2">
          <span class="common-h2-title">商品详情</span>
      </div>
      <div v-for="item in banner" :key="item.id">
          <div class="goods-content" v-html="item.detailHtml"></div>
      </div>
<!--      商品规格弹层-->
      <!--<van-sku-->
              <!--hide-quota-text-->
              <!--v-model="showSku"-->
              <!--:sku="skuData.sku"-->
              <!--:goods="skuData.goods_info"-->
              <!--:goods-id="skuData.goods_id"-->
              <!--:hide-stock="skuData.sku.hide_stock"-->
              <!--:quota=1-->
              <!--:quota-used="skuData.quota_used"-->
              <!--@buy-clicked="onBuyClicked">-->
          <van-sku
                  v-model="showSku"
                  :sku="skuData.sku"
                  :goods="skuData.goods_info"
                  :goods-id="skuData.goods_id"
                  :quota="1"
                  :show-add-cart-btn="false"
                  :quota-used="skuData.quota_used"
                  :hide-stock="skuData.sku.hide_stock"
                  @buy-clicked="onBuyClicked"
          />
          <template slot="sku-header" slot-scope="props" v-for="(item,index) in cm">
              <div style="margin-left: 10px;">
                  <img :src="picture" width="80">
              </div>
              <div style="width: 30px;height: 20px;float: right;margin-top: -70px;margin-left: -20px">
              <van-icon name="cross" style="margin-left: 5px" @click="clos"></van-icon>
              </div>
              <div class="van-sku__goods-price" :class="[marketing.isBuy ? 'xiahua' : '']" >
                  <span class="van-sku__price-symbol">￥</span><span class="van-sku__price-num" v-if="price">{{ price }}</span>
                  <span class="van-sku__price-num" v-if="!price">{{banner[0].price}}</span>
              </div>
              <div class="van-sku__goods-price" v-if="marketing.isBuy">
                  {{ marketing.info.label }}￥<span class="van-sku__price-num">{{ marketing.info.minPrice }}*10</span>
              </div>
          </template>
          <template slot="sku-actions" slot-scope="props">
              <div class="gui" v-for="(item,index) in cm">
                  <span  v-if="status==index" style="background:#c9c9c9" v-on:click="jiage(index)">{{item.sp1}} / {{item.sp2}}</span>
                  <span v-else v-on:click="jiage(index)">{{item.sp1}} / {{item.sp2}}</span>
              </div>
              <div class="van-sku-actions">
                  <van-button
                          square
                          size="large"
                          type="danger"
                          @click="props.skuEventBus.$emit('sku:buy')">
                      立即购买
                  </van-button>
              </div>
          </template>
      <!--</van-sku>-->
    <!-- 商品导航栏 -->
    <van-goods-action v-if="marketing.type">
      <van-goods-action-button type="warning"
        :text="marketing.actions[0].text"
        @click="onClickBuy" />
      <van-goods-action-button type="danger"
        :text="marketing.actions[1].text"
        @click="onClickMarketing(marketing.type)" />
    </van-goods-action>
    <van-goods-action v-else>
      <van-goods-action-icon icon="thumb-circle-o"
        text="首页"
        to="/index/"
        replace />
      <van-goods-action-button
              :disabled="disabled"
              type="danger"
        text="立即购买"
         @click="onShowSku"/>
    </van-goods-action>
  </div>
</template>
<script>
import { Swipe, SwipeItem, Sku, GoodsAction, GoodsActionIcon,Stepper, GoodsActionButton, Rate, Tag, CountDown } from 'vant'
import { storage, sessionStorage } from '@/common/util'
import util from '@/common/util'
import router from '@/router'
export default {
  components: {
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Sku.name]: Sku,
    [GoodsAction.name]: GoodsAction,
    [GoodsActionIcon.name]: GoodsActionIcon,
    [GoodsActionButton.name]: GoodsActionButton,
    [Rate.name]: Rate,
    [Tag.name]: Tag,
    [Stepper.name]: Stepper,
    [CountDown.name]: CountDown
  },
  data: function() {
    return {
      picture: '',
      shopskuId: '',  //选中的商品规格的id
      price: '',
      status: 0,
      cm: [],
      marketing: {},
      pintuanList: [],
      disabled: false,
      cartCount: '',
      backTop: false,
      banner: [],
      rateList: [],
      reputation: {},
      basicInfo: {},
      logistics: {},
      content: '',
      properties: [],
      showCoupon: false,
      hasFav: false,
      coupons: [],
      showPopup: false,
      showPtPopup: false,
      currentPintuan: {}, // 当前选中拼团数据
      propTitle: '选择',
      showSku: false,
      skuData: {
        goods_id: '',
        quota: 0, // 0表示不限购
        quota_used: 0,
        goods_info: {},
        sku: {
          price: '0.00', // 默认价格（单位元）
          stock_num: 0, // 商品总库存
          none_sku: false, // 是否无规格商品
          hide_stock: false, // 是否隐藏剩余库存
          collection_id: 26, // 无规格商品 skuId 取 collection_id，否则取所选 sku 组合对应的 id
          tree: [],
          list: [],
          messages: []
        }
      }
    }
  },
  created() {
    this.getGoodsDetail(this.$route.query.id);
    // this.onBuyClicked(this.$route.query.id)
    this.getGoodsDetails(this.$route.query.id)
  },
  mounted() {
    window.addEventListener('scroll', this.onPageScroll, false)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onPageScroll, false)
  },
  methods: {

    clos(){
      this.showSku = false
    },
    // 获取商品详情
    getGoodsDetail(goodsId) {
      this.$request.get('/shop/desc', {goodsId,token: storage.get('token'),}).then(res => {
        // console.log(res)
        if(res.data.stock <10 ){
          this.disabled = true
        }
        if (res.code !== 200) {
          this.$toast(res.message)
          return
        }
        this.banner.push(res.data)
      })
    },
    // 收藏
    //   marketingType: function (type, set = {}) {
    //       const marketing = {
    //               'default': {
    //                   type: '',
    //                   info: {
    //                       title: '普通',
    //                       minPrice: this.basicInfo.minPrice,
    //                       originalPrice: this.basicInfo.originalPrice
    //                   }
    //               }
    //           },
    //       this.marketing = marketing[type],
    //       checkGoodsFav(id){
    //           this.$request.get('/shop/goods/fav/check', {goodsId: id, token: storage.get('token')}).then(res => {
    //               if (res.code === 0) {
    //                   this.hasFav = true
    //               } else {
    //                   this.hasFav = false
    //               }
    //           })
    //       },
    //       onFavAdd(id){
    //           this.$request.post('/shop/goods/fav/add', {goodsId: id, token: storage.get('token')}).then(res => {
    //               if (res.code === 0) {
    //                   this.$toast({message: '收藏成功', duration: 1500})
    //                   this.hasFav = true
    //               } else {
    //                   this.hasFav = false
    //               }
    //           })
    //       },
    //       onFavDelete(id){
    //           this.$request.post('/shop/goods/fav/delete', {goodsId: id, token: storage.get('token')}).then(res => {
    //               if (res.code === 0) {
    //                   this.$toast({message: '取消收藏成功', duration: 1500})
    //                   this.hasFav = false
    //               } else {
    //                   this.hasFav = true
    //               }
    //           })
    //       },
    //   }
    //   商品担保
    //   onShowPopup() {
    //       this.showPopup = !this.showPopup
    //   },
    // 弹出规格
    onShowSku() {
      const key = util.storage.get('token')
      const id = this.banner[0].id
      if(!key){
        router.replace({path:'/login'})
      }
    // this.$toast('点击按钮弹出sku规格弹层');
        this.showSku = !this.showSkugetSkuData
      },
      onMarketingAction(path) {
          // console.log(path)
          if (path.includes('order')) {
              this.onShowSku()
          } else {
              this.$router.push({ path })
          }
      },
      onClickBuy() {
          this.marketing.isBuy = false
          this.onShowSku()
      },
      // 点确定触发
      onBuyClicked(data) {
          let token = storage.get('token')
        window.location.href = 'http://shop.winbeitech.com/pay/?data='+this.shopskuId+'&token='+token
        // this.$router.push({ path: '/pay/',query:{data:this.shopskuId,token: storage.get('token')}})
      },
      initSkuData(properties, basicInfo) {
          // 商品规格sku数据
          const tree = properties.map((item, index) => ({
              k: item.name,
              k_id: item.id,
              v: item.childsCurGoods,

              k_s: 's' + (index + 1),
              count: item.childsCurGoods.length
          }))
          this.skuData.goods_info = {
              title: basicInfo.name,
              picture: basicInfo.pic
          }
          this.skuData.goods_id = basicInfo.id // 商品id
          this.skuData.sku.price = basicInfo.minPrice.toFixed(2) // 默认价格（单位元）
          this.skuData.sku.stock_num = basicInfo.stock // 商品总库存
          this.skuData.sku.tree = tree
          // 商品无规格
          if (tree.length === 0) {
              this.propTitle = ''
              this.skuData.none_sku = true
              // this.skuData.collection_id= 2261
              return
          }

          // 商品多个规格
          this.propTitle = `选择 ${tree.reduce((total, item) => total + ' ' + item.k, '')}`
          if (tree.length > 0) {
              /**
               * 生成笛卡尔积
               * @returns {*}
               */
              const descartes = function(array) {
                  if (array.length < 2) return array[0] || []
                  return [].reduce.call(array, function(col, set) {
                      var res = []
                      col.forEach(function(c) {
                          set.forEach(function(s) {
                              var t = [].concat(Array.isArray(c) ? c : [c])
                              t.push(s)
                              res.push(t)
                          })
                      })
                      return res
                  })
              }
              const calc = descartes(Array.prototype.concat.apply([], tree.map(item => [item.v])))
              this.skuData.sku.list = calc.map(item => {
                  const obj = {
                      price: parseFloat((basicInfo.minPrice * 100).toFixed(2)), // 价格（单位分）
                      stock_num: basicInfo.stores // 当前 sku 组合对应的库存
                  }
                  if (Array.isArray(item)) {
                      // 2种规格以上
                      item.forEach((v, i) => {
                          obj[`s${i + 1}`] = v.id
                          obj.propertyChildIds = `${obj.propertyChildIds || ''}${v.propertyId}:${v.id},`
                          obj.id = `${obj.id || ''}${v.propertyId}${v.id}`
                      })
                      return obj
                  } else {
                      // 只有一种规格的情况下
                      obj['s1'] = item.id
                      obj.propertyChildIds = `${item.propertyId}:${item.id},`
                      obj.id = `${item.propertyId}${item.id}`
                      return obj
                  }
              })
          }
      },
      // 获取商品规格
      getGoodsDetails(goodsId) {
          this.$request.get('/shop/stock', {goodsId,token: storage.get('token'),}).then(res => {
            // console.log(res)
              if (res.code !== 200) {
                  this.$toast(res.message)
                  return
              }
              this.cm = res.data
            this.shopskuId =  this.cm[0].id
            this.price = this.cm[0].price
            this.picture = this.cm[0].pic
              this.skuData.sku.stock_num = this.cm[0].stock
              // console.log(this.cm)
          })
      },
      // 单击显示价格
      jiage(index){
          this.status=index;
         this.price =  this.cm[index].price
          this.shopskuId=this.cm[index].id
        this.picture =  this.cm[index].pic
          console.log(this.cm[index].stock)
          this.skuData.sku.stock_num = this.cm[index].stock
          // console.log(this.shopskuId)
      }
  }
}
</script>
<style lang="less" scoped>
    .van-sku__goods-price{
        margin-left: 100px;
        margin-top: -30px;
    }
    .van-stepper van-sku__stepper{
        display: none;
    }
    .gui{
        margin: 20px 0 20px 15px;
    }
    .gui span{
        border: #2d8cf0 1px solid;
        border-radius: 30px;
        width:auto;
        height: 25px;
        padding: 3px 10px;
        box-sizing: border-box;
    }
.xiahua{
  text-decoration:line-through;
  color:#999;
}
.text-left {
  text-align: left;
}
// .goods-swiper,.goods-swiper img{
//   width: 100%;
//   height: 410px;
// }
.goods-desc {
  box-sizing: border-box;
  padding: 0 15px;
  background: #fff;
  &-hd {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding:10px 0;
  }
  &-name {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    flex:1;

  }
  &-price {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    &_min{
      font-size: 24px;
      color: #f44;
    }
    &_original{
      font-size: 12px;
      color: #999;
      text-decoration: line-through;
    }
    &_label{
      margin-left: 10px;
      box-sizing: border-box;
      display: inline-block;
      font-size: 10px;
      padding:2px 4px;
      border-radius:4px;
      color: #f44;
      border: 1px solid #f44;
    }
  }

  &-brief {
    font-size: 12px;
    color: #888;
    margin-bottom: 10px;
  }

  &-more {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding:10px 0;
    &-item {
      flex: 1;
      font-size: 12px;
      color: #999;
    }
  }
  .btn-fav{
    box-sizing: border-box;
    display: inline-block;
    font-size: 12px;
    width:60px;
    text-align: center;
    padding:2px 10px;
    border-radius:10em;
    background-color: #fff;
    color: #666;
    border: 1px solid #ebedf0;
  }
  .btn-fav-danger{
    color: #f44;
    border: 1px solid #f44;
  }
}

.goods-content /deep/ img {
  max-width: 100% !important;
  height: auto !important;
}
.goods-content {
  box-sizing: border-box;
  background: #fff;
}

.goods-reputation {
  background: #fff;
  &-inner {
    padding: 0 15px;
    &-hd {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
      color: #666;
    }
    &-media {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      overflow: hidden;
      background: #eee;
      margin-right: 5px;
    }
    &-name {
      flex: 1;
    }
    &-stars {
    }
    &-tag {
      padding: 2px 10px;
      border-radius: 10px;
      border: 1px solid #979797;
      font-size: 10px;
      color: #999;
      margin-right: 10px;
    }
    &-bd {
      padding: 10px 0;
    }
    &-ft {
      padding: 5px 0 10px;
      font-size: 14px;
      color: #999;
    }
  }
}
.service-desc {
  height: 70vh;
  padding: 10px 15px;
  font-size: 14px;
  color: #666;
}
.popup-coupon {
  position: relative;
  padding-top: 44px;
  padding-bottom: 50px;
}
.coupon-list {
  padding: 10px 15px;
  max-height: 70vh;
  overflow-y: auto;
  &-header {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    top: 0;
    left: 0;
    font-size: 14px;
    color: #333;
    padding: 10px 0;
    text-align: center;
  }
}
.coupon-list-item {
  box-sizing: border-box;
  height: 76px;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #ffeeee;
  color: #ff4b52;
  margin-bottom: 10px;
  border-radius: 10px;
  &-hd {
    width: 100px;
    text-align: center;
    border-right: 1px slategrey #eee;
  }
  &-money {
    font-size: 24px;
    font-weight: bold;
    // margin-bottom:10px;
  }
  &-moneyHreshold {
    font-size: 12px;
  }
  &-bd {
    flex: 1;
  }
  &-name {
    font-size: 14px;
    padding: 5px 0;
  }
  &-dateEndDays {
    font-size: 12px;
    color: #d7a0a5;
  }
  &-btn {
    margin-right: 25px;
    display: inline-block;
    padding: 0.2em 0.5em;
    color: #fff;
    background: #ff4444;
    font-size: 10px;
    line-height: normal;
    border-radius: 0.8em;
  }
  &-btn-clicked {
    color: #ff4444;
    background: #ffffff;
    border: 1px solid #ff4444;
    pointer-events: none;
  }
}
/* 商品玩法 */
.countdown{
  box-sizing:border-box;
  padding:0 15px;
  height:45px;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content: space-between;
  background: linear-gradient(
    180deg,
    rgba(255, 70, 57, 1) 0%,
    rgba(255, 112, 61, 1) 100%
  );
  &-title{
    font-size: 18px;
    font-weight:bold;
  }
  &-value{
    font-size: 12px;
    color:#fff;
  }
  /deep/.van-count-down, .van-divider{
    font-size: 12px;
    color:#fff;
  }
}
.rule{
  background-color: #fffbe8;
  font-size: 14px;
  color: #999;
  padding:10px 15px;
  &-header{
    display:flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom:10px;
    &-title{
      color:#ed6a0c;
      flex:1;
    }
    &-value{
      font-size: 12px;
    }
  }
  &-body{
    font-size: 12px;
    color: #999;
  }
}
.pintuan{
  &-list{
    }
  &-item{
    padding:10px 15px;
    display:flex;
    align-items: center;
    justify-content: flex-start;
    &-media{
      width:40px;
      height:40px;
      overflow: hidden;
      border-radius:50%;
      margin-right:5px;
    }
    &-name{
      flex: 1;
    }
    &-info{
      flex:1;
      text-align:right;
      margin-right:10px;
      &__bd{
        display:flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
    &-btn{
      font-size: 14px;
      padding:8px 15px;
      border-radius:20px;
      color: #fff;
      background:linear-gradient(309deg,rgba(255,112,61,1) 0%,rgba(255,70,57,1) 100%);
    }
    &-btn:active{
      opacity:.8
    }
  }
}
@border-radius: 25px;
.btn-danger{
  flex:1;
  box-sizing: border-box;
  width:100%;
  display:inline-block;
  border-radius:@border-radius;
  text-align:center;
  padding:12px 0;
  font-size: 14px;
  color:#fff;
  background:linear-gradient(309deg,rgba(255,112,61,1) 0%,rgba(255,70,57,1) 100%);
}
/* 弹层*/
.my-popup{
  box-sizing: border-box;
  background:#fff;
  padding:25px 46px;
  text-align:center;
  width:260px;
  border-radius:16px;
  &-header{
    font-weight: bold;
    color:#1A1A1A;
    font-size: 16px;
    padding:10px 0;
  }
  &-close{
    position: absolute;
    top:15px;
    right:15px;
    font-size: 22px;
    color:#bfbfbf;
  }
}
.pintuan-popup{
  padding:25px 30px;
  &-sub{
    width:100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    color:#666;
    margin-bottom:10px;
  }
  &-inner{
    width:100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom:20px;
  }
  &-avatar+&-avatar{
    margin-left:10px;
  }
  &-avatar{
    box-sizing: border-box;
    width:60px;
    height:60px;
    border-radius:50%;
    overflow:hidden;
    border:1px solid #c0c0c0;
    &--empty{
      font-size: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
.popup {
  position: relative;
  padding-bottom: 50px;
  &-confirm {
    position: absolute;
    left: 0;
    bottom: 0;
  }
  &-close {
    position: absolute;
    top: 10px;
    right: 15px;
    color: #969799;
    font-size: 20px;
    text-align: center;
  }
}
.side-bar{
  position:fixed;
  right: 15px;
  bottom:60px;
  z-index:99;
  min-height:80px;
  &-share,&-backtop{
    box-sizing: border-box;
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid #7d7e80;
    width: 32px;
    height: 32px;
    box-shadow: 0 0 2px 3px hsla(0,0%,86.3%,.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.anim-scale {
    animation-name: anim-scale;
    animation-duration: .3s;
    animation-fill-mode: both;
}
@keyframes anim-scale {
    0% {
        opacity: .3;
        -ms-transform: scale(.5);
        transform: scale(.5)
    }

    100% {
        opacity: 1;
        -ms-transform: scale(1);
        transform: scale(1)
    }
}
</style>

