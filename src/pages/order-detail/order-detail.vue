<template>
  <div class="container">
    <!--<div class="header mb10">-->
<!--&lt;!&ndash;      v-if="orderInfo.status > 0"&ndash;&gt;-->
      <!--<div class="header-hd">-->
        <!--<div class="header-media">-->
          <!--<van-icon name="description" />-->
        <!--</div>-->
      <!--</div>-->
      <!--<van-steps :active="active">-->
        <!--<van-step v-for="(v,i) in steps" :key="i">{{v}}</van-step>-->
      <!--</van-steps>-->
    <!--</div>-->
      <div class="address-box mb10">
<!--      v-if="orderInfo.isNeedLogistics"-->
      <div class="address-box-hd">
        <div class="address-box-inner">
          <van-icon name="location-o" class="address-box-inner-icon" />
<!--          {{logistics.receiverName}}-->
          <div class="address-box-inner-title">收货人：{{logistics.receiverName}}</div>
          <div class="address-box-inner-title">{{logistics.receiverPhone}}</div>
        </div>
        <div class="address-box-inner-bottom">收货地址：{{logistics.receiverDetailAddress}}</div>
      </div>
      <div class="address-box-bd van-hairline--top">物流信息：{{logistics.deliveryCompany}} {{logistics.trackingNumber}}</div>    <!--  v-if="logistics.trackingNumber"-->
    </div>
    <van-panel class="panel"
      title="商品信息">
      <template slot="default">
<!--        :tag="marketing.typeStr"-->
        <van-card v-for="(good,index) in goods"
          :key="index"
          :num="good.productQuantity"
          :price="good.productPrice"
          :desc="good.description"
          :title="good.productName"
          :thumb="good.productPic">
            <div slot="tags">
                <van-tag plain type="danger">{{logistics.orderItemList[0].sp1}}</van-tag>
                <van-tag plain type="danger" style=" font-size: 14px;">{{logistics.orderItemList[0].sp1}}</van-tag>
            </div>
        </van-card>
      </template>
      <div slot="footer"
        class="panel-actions">
        <van-button v-if="status === 3"
          plain
          round
          size="small"
          type="danger"
          @click="onShowPopup()">评价</van-button>
        <van-button v-if="status > 0 "
          plain
          round
          size="small"
          type="danger"
          @click="onRefundOrder()">退换</van-button>
      </div>
    </van-panel>
    <van-cell title="配送方式"
      value="快递发货" />
    <van-cell title="买家留言"
      :value="'无'" />
<!--    <van-cell class="ui-right mb10">-->
<!--      <template slot="title">商品小计：-->
<!--        <span class="ui-c-red">￥{{logistics.orderItemList.length}}</span>-->
<!--      </template>-->
<!--    </van-cell>-->
    <div class="cell-group mb10">
      <div class="cell">
        <div class="cell-hd">商品金额</div>
        <div class="cell-bd">￥{{logistics.orderItemList[0].productPrice}}</div>
      </div>
      <div class="cell">
        <div class="cell-hd">运费</div>
        <div class="cell-bd">包邮</div>
      </div>
      <div class="cell" v-if="!marketing.type">
        <div class="cell-hd">优惠</div>
        <div class="cell-bd">-{{youhui}}元</div>
      </div>
      <van-cell class="ui-right">
        <template slot="title">实付款：
          <span class="ui-c-red ui-font-bold">￥{{logistics.payAmount}}</span>
        </template>
      </van-cell>
    </div>
    <div class="footer">
      <div class="footer-p">订单编号：{{logistics.orderSn}} <van-button plain type="default" size="mini" @click="handleClipboard(logistics.orderSn,$event)">复制</van-button></div>
      <div class="footer-p">创建时间：{{logistics.createTime}} </div>
    </div>
      <div class="back">
          <van-button plain type="primary" size="mini" @click="goback()">返回首页</van-button>
      </div>
  </div>
</template>

<script>
import { Tab, Tabs, Card, Panel, List, Step, Steps, Rate, Field, Tag } from 'vant'
import { storage } from '@/common/util'
import { pay_balance } from '@/common/pay'
import clipboard from '@/common/clipboard'

export default {
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Card.name]: Card,
    [Panel.name]: Panel,
    [List.name]: List,
    [Step.name]: Step,
    [Steps.name]: Steps,
    [Rate.name]: Rate,
    [Field.name]: Field,
    [Tag.name]: Tag
  },
  data() {
    return {
      youhui:'',
      orderid:'',
      sku:[],
      marketing: {},
      steps: ['未支付', '买家付款', '商家发货', '交易完成'],
      orderInfo: {},
      goods: [],
      orderId:'',
      dizhi:{},
      status:'',
      logistics: {},
      active: 0,
      hasSteps: false,
      visible: false,
      rateValue: 5,
      // reputation:2,   // 0 差评 1 中评 2 好评
      rateRemark: '', // 评价备注，限200字符
      closeTime: 0
    }
  },
  computed: {
    reputation: {
      get() {
        let value = 2
        switch (this.rateValue) {
          case 1:
            value = 0
            break
          case 2:
            value = 1
            break
          case 3:
            value = 1
            break
          case 4:
            value = 2
            break
          case 5:
            value = 2
            break
          default:
            value = 2
        }
        return value
      },
      set() {
        this.rateValue = 3
      }
    }
  },
  created() {
    var resualt = new Object()
    resualt = this.getSearchString(window.location.search)
    if(resualt["channel"] == '1'){
      this.orderId = resualt['id']
    }
    this.orderId = this.$route.query.id
    this.status = this.$route.query.status
    this.sku = this.$route.query.params
    this.getOrderDetail()
  },
  methods: {
    goback(){
      this.$router.push({ path: '/index/'})
    },
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
    formatPrice(price) {
      return parseFloat(price).toFixed(2)
    },
    onShowPopup() {
      this.visible = !this.visible
    },
    onRefundOrder() {
      this.$router.push({ path: 'refund-apply',query: { orderId: this.orderId }})
    },
    onDeliveryOrder() {
      this.$dialog.confirm({
        title: '提示',
        message: '确认您已收到商品？'
      }).then(() => {
        // on confirm
        this.$toast.loading({
          mask: true,
          message: '加载中...',
          duration: 0
        })
        this.$request.post('/order/delivery', { orderId: this.orderInfo.id, token: storage.get('token') }).then(res => {
          if (res.code !== 0) {
            this.$toast(res.message)
            return
          }
          this.$router.go(-1)
          this.$toast({ message: '收货成功!', duration: 1500 })
        })
      }).catch(() => {
      })
    },
    onCancelOrder() {
      const orderId = this.orderInfo.id
      this.$dialog.confirm({
        // title: '提示',
        message: '订单还未付款,确定要取消吗?',
        cancelButtonText: '在考虑下',
        confirmButtonText: '取消订单'
      }).then(() => {
        // on confirm
        this.$toast.loading({
          mask: true,
          message: '加载中...',
          duration: 0
        })
        this.$request.post('/order/close', { orderId, token: storage.get('token') }).then(res => {
          // console.log(`/order/close：${JSON.stringify(res)}`)
          this.$toast({ message: '取消订单成功', duration: 1500 })
          this.$router.go(-1)
        })
      }).catch(() => {
        // on cancel
      })
    },
    onPayOrder() {
      const orderId = this.orderInfo.id
      // const amountReal = this.orderInfo.amountReal
      this.$toast.loading({
        mask: true,
        message: '支付提交中',
        duration: 0
      })
      pay_balance(orderId, storage.get('token')).then(res => {
        if (res.code === 0) {
          this.$toast.clear()
          this.$router.replace({ path: '/order-detail', query: { id: this.orderInfo.id }})
        } else {
          this.$toast(res.message)
        }
      })
    },
    onSubmitRate() {
      const rateArray = this.goods.map(item => ({ id: item.id, reputation: this.reputation, remark: this.rateRemark }))
      const params = {
        token: storage.get('token'),
        orderId: this.orderInfo.id,
        reputations: rateArray
      }
      this.$toast.loading({
        mask: true,
        message: '加载中...',
        duration: 0
      })
      this.$request.post('/order/reputation', { postJsonString: JSON.stringify(params) }).then(res => {
        if (res.code !== 0) {
          this.$toast(res.message)
          return
        }
        this.$router.go(-1)
        this.$toast({ message: '评价成功!', duration: 1500 })
        this.onShowPopup()
      })
    },
    getOrderDetail() {
      this.$request.post('/order/detail/'+ this.orderId ,{token: storage.get('token')}).then(res => {
        if (res.code !== 200) {
          this.$toast(res.message)
          return
        }
        this.orderInfo = res.data.status
        // console.log(this.orderInfo)
        this.goods = res.data.orderItemList
        this.logistics = res.data
        this.youhui = res.data.couponAmount
        if (this.orderInfo > 0) {
          this.hasSteps = true
          this.active = this.orderInfo - 1
        }
        if (this.orderInfo === 0 && this.orderInfo.dateClose) {
          const last = Date.now()
          const close = new Date(this.orderInfo.dateClose.replace(/-/g, '/')).getTime()
          if (close > last) {
            this.closeTime = Math.floor((close - last) / 1000 / 60)
          }
        }
      })
    },
    handleClipboard(text, event) {
      clipboard(text, event)
    }
  }
}
</script>

<style lang="less" scoped>
    .back{
        width: 100%;
        text-align: center;
        margin-top: 20px;
    }
    .van-tag van-tag--plain van-tag--danger van-hairline--surround{
    }
.color-red {
  color: #f44 !important;
}
.container{
  padding-bottom:20px;
}
//
.header {
  min-height: 80px;
  padding: 0 5px;
  background: #fff;
  &-title {
    font-size: 14px;
    color: #333;
  }
  &-txt {
    font-size: 12px;
    color: #979797;
  }
  &-hd {
    display: flex;
    align-items: center;
    padding: 10px 10px 0;
  }
  &-media {
    display: inline-block;
    padding: 5px 5px;
    background: #00c062;
    border-radius: 4px;
    margin-right:10px;
    /deep/ .van-icon {
      font-size: 32px;
      vertical-align: top;
      color: #fff;
    }
  }
  &-media-gray {
    background: #c9c9c9;
  }
}
//
.address-box {
  position: relative;
  box-sizing: border-box;
  min-height: 60px;
  // display: flex;
  // justify-content: flex-start;
  // align-items: center;
  padding: 8px 15px;
  background: #fff;
  &-hd {
    flex: 1;
    // padding:0 10px;
    padding-left: 20px;
  }
  &-bd {
    margin-top: 10px;
    padding: 10px 15px 5px;
    font-size: 14px;
    color: #333;
  }
  &-inner {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &-icon {
      position: absolute;
      top: 2px;
      left: -20px;
    }
    &-title {
      font-size: 14px;
      color: #333;
      font-weight: bold;
      margin-bottom: 5px;
    }
    &-bottom {
      font-size: 12px;
      color: #999;
    }
  }
  &:before {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    background: -webkit-repeating-linear-gradient(
      135deg,
      #ff6c6c 0,
      #ff6c6c 20%,
      transparent 0,
      transparent 25%,
      #1989fa 0,
      #1989fa 45%,
      transparent 0,
      transparent 50%
    );
    background: repeating-linear-gradient(
      -45deg,
      #ff6c6c 0,
      #ff6c6c 20%,
      transparent 0,
      transparent 25%,
      #1989fa 0,
      #1989fa 45%,
      transparent 0,
      transparent 50%
    );
    background-size: 80px;
    content: "";
  }
}
.address-card {
  position: relative;
  padding: 10px 15px;
  align-items: center;
  &:before {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    background: -webkit-repeating-linear-gradient(
      135deg,
      #ff6c6c 0,
      #ff6c6c 20%,
      transparent 0,
      transparent 25%,
      #1989fa 0,
      #1989fa 45%,
      transparent 0,
      transparent 50%
    );
    background: repeating-linear-gradient(
      -45deg,
      #ff6c6c 0,
      #ff6c6c 20%,
      transparent 0,
      transparent 25%,
      #1989fa 0,
      #1989fa 45%,
      transparent 0,
      transparent 50%
    );
    background-size: 80px;
    content: "";
  }
}
.address-card .van-cell__left-icon {
  color: #1989fa;
  font-size: 40px;
}
.address-card .van-cell__title {
  line-height: 40px;
}
//
.cell-group {
  box-sizing: border-box;
  padding: 10px 0;
  background: #fff;
}
.cell {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  color: #555;
  line-height: 20px;
  padding-left: 15px;
  padding-right: 15px;
  background: #fff;
  &-hd {
  }
  &-bd {
    flex: 1;
    text-align: right;
  }
}
//
.footer {
  padding: 20px 15px;
  background: #fff;
}
.footer-p {
  font-size: 12px;
  line-height: 20px;
  color: #999;
}
.card-button {
  display: inline-block;
  margin-right: 10px;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  color: #666;
  border: 1px solid #b9b9b9;
}
.card-button-danger {
  color: #f44;
  border: 1px solid #f44;
}
.card-button:active {
  opacity: 0.8;
}
//
.popup {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  min-height: 300px;
  &-close {
    position: absolute;
    top: 10px;
    right: 15px;
    z-index: 20;
    color: #969799;
    font-size: 20px;
    text-align: center;
  }
  &-body {
    width: 100%;
    flex: 1;
  }
  &-title {
    font-size: 16px;
    text-align: center;
    padding: 10px 0;
  }
  &-bottom {
    width: 100%;
  }
  .rate-box {
    padding: 0px 15px;
    margin-bottom: 30px;
  }
}
.panel-actions{
    text-align:right;
    .van-button{
      margin-left:10px;
    }
  }
  .affix-bar{
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    background-color: #fff;
    user-select: none;
    &__bar{
      // padding:0 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      font-size: 14px;
    }
    &__button{
      // width: 100%;
      // height: 50px;
      // line-height: 48px;
    }
    &__left{
      max-width:110px;
    }
    &__inner{
      padding-right:15px;
      flex:1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
</style>

