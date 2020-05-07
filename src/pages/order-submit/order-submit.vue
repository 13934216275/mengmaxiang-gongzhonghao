<template>
    <div class="container pd100">
        <template v-if="isNeedLogistics">
            <div class="address-box mb10" v-if="defaultAddress.name" @click="onAddressChoose">
                <div class="address-box-hd">
                    <div class="address-box-inner">
                        <van-icon name="location-o" class="address-box-inner-icon"/>
                        <div class="address-box-inner-title">收货人：{{defaultAddress.name}}</div>
                        <div class="address-box-inner-title">{{defaultAddress.phoneNumber}}</div>
                    </div>
                    <div class="address-box-inner-bottom">收货地址：{{defaultAddress.detailAddress}}</div>
                </div>
                <div class="address-box-bd"><van-icon name="arrow" /></div>
            </div>
            <div class="address-box mb10" v-else-if="isHasveDeft" @click="onAddressChoose">
                <div class="address-box-hd">
                    <div class="address-box-inner">
                        <van-icon name="location-o" class="address-box-inner-icon"/>
                        <div class="address-box-inner-title">收货人：{{defaultAddress.name}}</div>
                        <div class="address-box-inner-title">{{defaultAddress.phoneNumber}}</div>
                    </div>
                    <div class="address-box-inner-bottom">收货地址：{{defaultAddress.detailAddress}}</div>
                </div>
                <div class="address-box-bd"><van-icon name="arrow" /></div>
            </div>
            <van-cell v-else class="address-card mb10" title="新增收货地址" icon="add-square" is-link @click="onAddressChoose"></van-cell>
        </template>
        <div class="order-info">
            <van-cell-group>
                <van-cell title="商品列表"></van-cell>
                <van-card
                        v-for="(item,index) in ordershop"
                        :tag="marketing.typeStr"
                        :key="index"
                        :num="item.selectedNum"
                        :desc="item.sp1+item.sp2"
                        :price="item.price"
                        :title="item.name"
                        :thumb="item.pic"
                >
                </van-card>

                <van-coupon-cell
                        v-if="coupons.length"
                        :coupons="coupons"
                        :chosen-coupon="chosenCoupon"
                        @click="onShowCoupons"
                />

                <van-cell v-if="isNeedLogistics" title="配送方式" value="快递"></van-cell>
            </van-cell-group>
            <van-cell-group>
                <van-field
                        class="mb10"
                        v-model="remark"
                        label="买家留言"
                        type="textarea"
                        placeholder="点击给商家留言"
                        rows="1"
                        autosize
                />
            </van-cell-group>
            <van-cell-group class="mb20">
                <van-cell title="支付方式" value="微信支付"></van-cell>
                    <template slot="default">
<!--                        <van-switch-->
<!--                                v-model="isBalancePay"-->
<!--                                active-color="#f44"-->
<!--                                inactive-color="#d7d7d7"-->
<!--                        />-->
                    </template>
            </van-cell-group>
            <van-cell title="商品金额" :value="'¥'+price"></van-cell>
            <van-cell v-if="isNeedLogistics" title="运费" value="+0.00"></van-cell>
            <van-cell v-if="hasDiscount" title="优惠" :value="'-'+youhui"></van-cell>
        </div>
        <van-submit-bar
                button-text="提交订单"
                @submit="onSubmit"
        >
            <div slot="default" class="submit-bar-left">
                <span>合计：</span>
                <span class="submit-bar-price">¥ {{price}}</span>
            </div>
        </van-submit-bar>
    </div>
</template>
<script>

  import { Card, Field, CouponCell, CouponList, SubmitBar, Switch } from 'vant'
  import { storage, sessionStorage } from '@/common/util'
  import { mapState, mapMutations } from 'vuex'
  import { pay_balance } from '@/common/pay'
  export default {
    components: {
      [Card.name]: Card,
      [Field.name]: Field,
      [CouponCell.name]: CouponCell,
      [CouponList.name]: CouponList,
      [SubmitBar.name]: SubmitBar,
      [Switch.name]: Switch
    },
    data() {
      return {
        isHasveDeft:false,
        price:'',
        goodsId:'',
        ordershop:[],  //订单中的商品
        remark: '',
        chosenCoupon: -1,
        coupons: [],
        disabledCoupons: [],
        showList: false,
        isNeedLogistics: true, // 是否需要物流信息
        hasDiscount: false,
        goodsInfo: [],
        isBalancePay: true, //  钱包支付
        expireMinutes: 60,
        marketing: {},
        addresid:'',
      }
    },
    computed: {
      ...mapState(['defaultAddress']),
      goodsPrice() {
        const price = this.goodsInfo.reduce((total, item) => total + item.selectedNum * item.price, 0)
        return parseFloat(price).toFixed(2)
      },
      totalPrice() {
        const youhui = this.chosenCoupon !== -1 ? parseFloat((this.coupons[this.chosenCoupon].value / 100).toFixed(2)) : 0
        const price = this.goodsInfo.reduce((total, item) => total + item.selectedNum * item.price, 0) - youhui
        return price > 0 ? parseFloat(price).toFixed(2) : '0.00'
      }
    },
    created() {
      // 获取购买商品的ID
      this.goodsId=this.$route.query.data
      // console.log(this.goodsId)
      this.getInfo(this.goodsId)
      // 默认地址
      if (!this.defaultAddress.name) {
        this.getDefaultAddress()
      }
    },
    methods: {
      ...mapMutations(['updateDefaultAddress']),
      // 获取购买的商品
      getInfo(goodsId){
             this.$request.get('/shop/shop_a',{id:this.goodsId,token: storage.get('token')}).then(res=>{
                // console.log(res)
               this.ordershop.push(res.data)
               this.price = this.ordershop[0].price
               // console.log(this.ordershop)
             })
      },
      onAddressChoose() {
        this.$router.push({ path: '/address-list', query: { isChoose: true }})
      },
      onShowCoupons() {
        this.showList = !this.showList
      },
      onChange(index) {
        this.showList = false
        this.chosenCoupon = index
        if (index > -1) {
          this.hasDiscount = true
        } else {
          this.hasDiscount = false
        }
      },
      // 点击提交订单
      onSubmit() {
        if (!this.defaultAddress.name) {
          this.$toast({ message: '地址栏不能为空', duration: 1500 })
          return
        }
        // 提交订单
        this.$toast.loading({
          mask: true,
          message: '订单创建中',
          duration: 0
        })
        const goods = this.goodsInfo.map(item => ({ goodsId: item.goodsId, number: item.selectedNum, propertyChildIds: item.propertyChildIds, logisticsType: 0 }))
        const params = {
          token: storage.get('token'),
          memberReceiveAddressId:this.addresid.id,
          skuStockId:this.ordershop[0].skuStockId,
          buyerRemain:this.ordershop[0].remark,
          selectedNum:this.ordershop[0].selectedNum,
          goodssp1:this.ordershop[0].sp1,
          goodssp2:this.ordershop[0].sp2,
          payType:1
        }
        // console.log(params)
        // 创建订单
        this.createOrder(params)
      },
      createOrder(params) {
        this.$request.post('/order/createOrder', params,{token: storage.get('token')}).then(res => {
          // console.log(res)
          const prepayid = res.data.prepay_id
          // console.log(prepayid)
          if (res.code !== 200) {
            this.$toast(res.message)
            return
          }
          this.$toast(res.message)
          this.$toast.clear()
          const orderResult = res.data
          pay_balance(orderId, storage.get('token')).then(res => {
            // console.log(res)
            this.$toast.clear()
          })
          // 微信支付订单
          // this.onPay(orderResult,params,prepayid)
        })
      },
      // 支付金额
    //   onPay(orderResult,params,prepayid) {
    //     const order = orderResult.order
    //     const sku = orderResult.orderItem
    //     const orderId = order.id
    //     const amountReal = sku.productPrice
    //     // console.log(order,sku,orderId,amountReal)
    //     if (this.isBalancePay) {
    //       this.$toast.loading({
    //         mask: true,
    //         message: '支付提交中',
    //         duration: 0
    //       })
    //         this.$request.post('/pay/jsPay',{token: storage.get('token'),prepay_id:prepayid}).then(res => {
    //           console.log(res)
    //           const data = res
    //             WeixinJSBridge.invoke(
    //               'getBrandWCPayRequest', {
    //                 "appId": data.appId,
    //                 "timeStamp": data.timeStamp,
    //                 "nonceStr": data.nonceStr,
    //                 "package": data.package,
    //                 "signType": data.signType,
    //                 "paySign": data.paySign,
    //               },
    //               function(res){
    //                 if(res.err_msg == "get_brand_wcpay_request:ok" ) {
    //
    //                 }else{
    //                       this.$router.replace({ path: '/order-detail', query: { id: orderId,params }})
    //                 }
    //               })
    //         })
    //   }
    //     else {
    //     // this.removeStorageGoods()
    //     this.$router.replace({ path: '/order-list/?status=0' })
    //   }
    // },
      // 获取地址
      getDefaultAddress() {
        this.$request.get('/member/address/default',{token: storage.get('token')}).then(res => {
          // console.log(res)
          this.addresid = res.data[0]
          if (res.data.length>0) {
            let info = res.data[0]
            this.defaultAddress.name = info.name
            this.defaultAddress.phoneNumber = info.phoneNumber
            this.defaultAddress.detailAddress = info.detailAddress
            this.isHasveDeft = true
          }
          // this.updateDefaultAddress(res.data || {})
        })
      },
      formatSeconds(value) {
        const time = new Date(value.replace(/-/g, '/')).getTime() / 1000
        return time
      },
      getMyDiscounts() {
        this.$request.get('/discounts/my', { token: storage.get('token'), status: '0' }).then(res => {
          if (res.code !== 0) {
            return
          }
          this.coupons = res.data.map(item => ({
            id: item.id,
            name: item.name,
            condition: `消费满 ${item.moneyHreshold} 可用`,
            startAt: this.formatSeconds(item.dateStart),
            endAt: this.formatSeconds(item.dateEnd),
            value: parseFloat((item.money * 100).toFixed(2)),
            valueDesc: `${item.money}`,
            unitDesc: '元'
            // description:`每人限领 2 张,消费满 ${item.moneyHreshold} 元可用`
          }))
        })
        this.$request.get('/discounts/my', { token: storage.get('token'), status: '1,2,3' }).then(res => {
          if (res.code !== 0) {
            return
          }
          // this.updateDefaultAddress(res.data)
          this.disabledCoupons = res.data.map(item => ({
            id: item.id,
            name: item.name,
            condition: `消费满 ${item.moneyHreshold} 可用`,
            startAt: this.formatSeconds(item.dateStart),
            endAt: this.formatSeconds(item.dateEnd),
            value: parseFloat((item.money * 100).toFixed(2)),
            valueDesc: `${item.money}`,
            unitDesc: '元',
            reason: item.statusStr
          }))
        })
      },
      getUserAmount() {
        this.$request.get('/user/amount', { token: storage.get('token') }).then(res => {
          if (res.code !== 0) {
            return
          }
          this.balance = res.data.balance
        })
      }
    }
  }
</script>

<style lang="less" scoped>
    .address-box{
        position: relative;
        box-sizing: border-box;
        min-height: 60px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding:8px 15px;
        background: #fff;
        &-hd{
            flex: 1;
            // padding:0 10px;
            padding-left: 20px;
        }
        &-bd{
            padding-left: 5px;

        }
        &-inner{
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            &-icon{
                position: absolute;
                top:2px;
                left: -20px;
            }
            &-title{
                font-size: 16px;
                color: #333;
                font-weight: bold;
                margin-bottom: 5px;
            }
            &-bottom{
                font-size: 12px;
                color: #666;
            }
        }
        &:before{
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            height: 2px;
            background: -webkit-repeating-linear-gradient(135deg, #ff6c6c 0, #ff6c6c 20%, transparent 0, transparent 25%, #1989fa 0, #1989fa 45%, transparent 0, transparent 50%);
            background: repeating-linear-gradient(-45deg, #ff6c6c 0, #ff6c6c 20%, transparent 0, transparent 25%, #1989fa 0, #1989fa 45%, transparent 0, transparent 50%);
            background-size: 80px;
            content: '';
        }
    }
    .address-card{
        position: relative;
        padding: 10px 15px;
        align-items: center;
        &:before{
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            height: 2px;
            background: -webkit-repeating-linear-gradient(135deg, #ff6c6c 0, #ff6c6c 20%, transparent 0, transparent 25%, #1989fa 0, #1989fa 45%, transparent 0, transparent 50%);
            background: repeating-linear-gradient(-45deg, #ff6c6c 0, #ff6c6c 20%, transparent 0, transparent 25%, #1989fa 0, #1989fa 45%, transparent 0, transparent 50%);
            background-size: 80px;
            content: '';
        }
    }
    .address-card .van-cell__left-icon{
        color: #1989fa;
        font-size: 40px;
    }
    .address-card .van-cell__title{
        line-height: 40px;
    }
    .order-info{
        box-sizing: border-box;
        width:100%;
        // padding:0 15px;
        // background: #fff;
    }
    .submit-bar-left{
        flex: 1;
        padding-right: 12px;
        color: #323233;
        font-weight: 500;
        text-align: right;
    }
    .submit-bar-left span{
        display: inline-block;
    }
    .submit-bar-price{
        color: #f44;
        font-size: 18px;
    }

</style>

