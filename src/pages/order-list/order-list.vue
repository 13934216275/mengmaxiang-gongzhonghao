<template>
  <div class="contaienr">
<!--    顶部-->
    <van-tabs v-model="active" class="mb10" @click="onClick">
      <van-tab :title="item.name" v-for="(item,index) in tabs" :key="index" />
    </van-tabs>

    <van-list v-model="loading" :finished="finished" :finished-text="finishedTxt" @load="onListLoad">
      <div class="list-item" v-for="item in list" :key="item.id">
        <van-panel class="panel" :title="'订单编号：'+item.orderSn" :status="status[item.status].name">
<!--          <div>{{tabs}}</div>-->
          <div>
            <router-link :to="{path:'/order-detail' ,query:{status:item.status,id:item.id}}">
              <van-card
                :num="goodsMap[item.id][0].productQuantity"
                :price="goodsMap[item.id][0].productPrice"
                :desc="goodsMap[item.id][0].sp1+goodsMap[item.id][0].sp2"
                :title="goodsMap[item.id][0].productName"
                :thumb="goodsMap[item.id][0].productPic" />
              <div class="card-load-more van-hairline--bottom" v-if="goodsMap[item.id].length>1">查看全部{{goodsMap[item.id].length}}件商品</div>
            </router-link>
            <div class="panel-money">共{{goodsMap[item.id].length}}件商品 合计：
              <span class="fz12">￥</span>
              <span class="ui-c-red fz16">{{goodsMap[item.id][0].productPrice}}</span>
            </div>
          </div>
          <div slot="footer" class="panel-actions" v-if="item.status === 0">
            <div class="panel-button" @click="onCancelOrder(item.id)">取消订单</div>
            <div class="panel-button panel-button-danger" @click="onPayOrder(item)">付款</div>
          </div>
          <div slot="footer" class="panel-actions" v-if="item.status === 2">
            <!--<router-link :to="'/order-detail?id='+item.id">-->
              <div class="panel-button panel-button-danger" @click="receiving(item)">确认收货</div>
            <!--</router-link>-->
          </div>
<!--          <div slot="footer" class="panel-actions" v-if="item.status === 3">-->
<!--            <router-link :to="'/order-detail?id='+item.id">-->
<!--              <div class="panel-button panel-button-danger">评价</div>-->
<!--            </router-link>-->
<!--          </div>-->
        </van-panel>
      </div>
    </van-list>
      <a id='links' href="#" style='display:none;'></a>
  </div>
</template>

<script>
import { Tab, Tabs, Card, Panel, List, Loading } from 'vant'
import { storage, debounce } from '@/common/util'
import { pay_balance } from '@/common/pay'

export default {
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Card.name]: Card,
    [Panel.name]: Panel,
    [List.name]: List,
    [Loading.name]: Loading
  },
  data() {
    return {
      tabs: [
        { name: '全部', status: '' },
        { name: '待付款', status: '0' },
        { name: '待发货', status: '1' },
        { name: '待收货', status: '2' },
        { name: '已完成', status: '3' }
      ],
      status: [
        { name: '待付款', status: '0' },
        { name: '待发货', status: '1' },
        { name: '待收货', status: '2' },
        { name: '已完成', status: '3' },
        { name: '已关闭', status: '4' },
        { name: '已完成', status: '5' },
        { name: '已申请退换', status: '6' }
      ],
      active: '',
      hxpayurl:'',
      hxpayid:'',
      goodsMap: {},
      list: [],
      skuList: [],
      page: 1,
      pageSize: 10,
      loading: false,
      finished: false,
      finishedTxt: '没有更多了'
    }
  },
  created() {
    // const status = this.$route.query.status === undefined ? 0 : parseInt(this.$route.query.status)
    // this.active = this.tabs.findIndex(item => item.status === status)
  },
  methods: {
    onListLoad() {
      this.getOrderList('', this.page++, this.pageSize)
    },
    onClick: debounce(function(index) {
      this.loading = true
      this.finished = false
      // console.log(this.tabs[index].status)
      this.getOrderList(this.tabs[index].status, 1, this.pageSize, true)
    }, 1000),
    getOrderList(status, page = this.page, pageSize = this.pageSize, isTab = false) {
      // 订单状态，-1 已关闭 0 待支付 1 已支付待发货 2 已发货待确认 3 确认收货待评价 4 已评价
      const params = {
        token: storage.get('token'),
        status,
        page,
        pageSize
      }
      this.$request.post('/order/list', params).then(res => {
        // console.log(res)
        this.list = []
        this.goodsMap = {}
        if (res.code === 200) {
          this.loading = false
          this.finished = true
          this.finishedTxt = page > 1 ? '没有更多了' : '您还没有任何订单哦~'
        }
        const list = res.data
        this.loading = false
        list.forEach(item => {
          this.goodsMap[item.id] = item.omsOrderItem
        })
        this.list = this.list.concat(list)
        // console.log(this.list)
        // console.log(this.list[0].id)
        this.finishedTxt = '没有更多了'
      })
      return
    },

    onCancelOrder(id) {
      // const orderId = id
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
        this.$request.post('/order/cancel/'+ id, {token: storage.get('token') }).then(res => {
          // console.log(`/order/close：${JSON.stringify(res)}`)
          this.$toast({ message: '取消订单成功', duration: 1000 })
          // this.getOrderList(this.tabs[this.active].status)
          this.list.splice(this.list.findIndex(item => item.id === id), 1)
        })
      }).catch(() => {
        // on cancel
      })
    },
    onPayOrder(data) {
      this.hxpayid = data.prepayId
      let token = storage.get('token')
      let sourceType = storage.get('sourceType')
      if(sourceType == 1){
        this.$request.post('/hxBank/payUrl', {token: storage.get('token'),prepay_id:this.hxpayid}).then(res => {
          this.hxpayurl = res.data.payUrl
          this.gohxpay()
        })
      }else{
        window.location.href = 'http://shop.winbeitech.com/pay/?orderId='+data.id+'&payId='+data.prepayId+'&paymentIf=1&token='+token
      }
      // const orderId = data.id
      // const amountReal = data.amountReal
      // this.$toast.loading({
      //   mask: true,
      //   message: '支付提交中',
      //   duration: 0
      // })
    },
    gohxpay(){
        var obj = document.getElementById('links')
        obj.href = this.hxpayurl
        obj.click()
    },
    receiving(data){
      const id = data.id
      this.$request.post('/order/update/status', {token: storage.get('token'),status:3,orderId:id}).then(res => {
        if(res.code == 200){
          this.$toast(res.message)
          window.location.reload()
        }else{
          this.$toast(res.message)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.list-item {
  margin-bottom: 10px;
}
.card-load-more{
  font-size: 14px;
  color:#f44;
  padding:5px;
  line-height:28px;
  text-align:center;
}
.panel {
  .van-panel__header-value {
    flex: none;
  }
  &-money {
    padding: 10px 15px;
    font-size: 14px;
    color: #333;
    text-align: right;
  }
  &-actions {
    text-align: right;
  }
  &-button {
    display: inline-block;
    margin-right: 10px;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 20px;
    color: #666;
    border: 1px solid #b9b9b9;
  }
  &-button-danger {
    color: #f44;
    border: 1px solid #f44;
  }
  &-button::active {
    opacity: 0.8;
  }
}
.no-data .van-loading__spinner {
  display: none;
}
</style>

