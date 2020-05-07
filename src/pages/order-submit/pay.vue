<template>
    <div class="container pd100">
        <template v-if="isNeedLogistics&&paymentIf!='1'" >
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
        <template v-if="paymentIf =='1'">
                <div class="address-box-hd">
                    <div class="address-box-inner">
                        <van-icon name="location-o" class="address-box-inner-icon"/>
                        <div class="address-box-inner-title">收货人：{{receiverName}}</div>
                        <div class="address-box-inner-title">{{phoneNumber}}</div>
                    </div>
                    <div class="address-box-inner-bottom">收货地址：{{tmd}}</div>
                </div>
        </template>
        <div class="order-info" v-if="paymentIf!= '1'">
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
                <van-cell title="支付方式" :value="xxhh"></van-cell>
                    <template slot="default">
                    </template>
            </van-cell-group>
            <van-cell title="商品金额" :value="'¥'+price"></van-cell>
            <van-cell v-if="isNeedLogistics" title="运费" value="包邮"></van-cell>
            <!-- 优惠券列表 -->
            <van-coupon-cell
                    :coupons="couponlists"
                    :chosen-coupon="chosenCoupon"
                    :value="xianshi"
                    @click="onShowCoupons"
            />
            <van-popup v-model="showList" position="bottom">
                <van-coupon-list
                        :coupons="couponlists"
                        :chosen-coupon="chosenCoupon"
                        :disabled-coupons="discouponlists"
                        :show-exchange-bar="false"
                        @change="onChange"
                />
            </van-popup>
        </div>
        <div class="order-info" v-if="paymentIf == '1'">
            <van-cell-group>
                <van-cell title="商品列表"></van-cell>
                <van-card
                        v-for="(item,index) in kkkshop"
                        :tag="marketing.typeStr"
                        :key="index"
                        :num="item.productQuantity"
                        :desc="item.sp1+item.sp2"
                        :price="item.productPrice"
                        :title="item.productName"
                        :thumb="item.productPic"
                >
                </van-card>
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
                <van-cell title="支付方式" :value="xxhh"></van-cell>
                <template slot="default">
                </template>
            </van-cell-group>
            <van-cell title="商品金额" :value="'¥'+kkkshop[0].productPrice"></van-cell>
            <van-cell v-if="isNeedLogistics" title="运费" value="包邮"></van-cell>
            <van-cell title="优惠金额">{{youhui}}</van-cell>
        </div>
        <van-submit-bar
                button-text="立即支付"
                @submit="onSubmit"
        >
            <div slot="default" class="submit-bar-left">
                <span>合计：</span>
                <span class="submit-bar-price">¥ {{TotalPrice}}</span>
            </div>
        </van-submit-bar>
        <a id='links' href="#" style='display:none;'></a>
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
        paysId:'', //微信直接下单的预支付ID
        componentAmount:0,
        youhui:'',
        kkkshop:{},
        detailAddress:'',
        phoneNumber:'',
        receiverName:'',
        tmd:'',
        payId:'',  //微信订单传的预支付ID
        orderId:'',
        paymentIf:'',  //从订单来到支付页面的标识
        TotalPrice:'',
        freight:0.00,
        couponId:'',
        jin:'',
        xxhh:'微信',
        isHasveDeft:false,
        price:'',
        goodsId:'',    //直接下单传的商品ID
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
        sourceTypes:2,
        hxpays:'',
        couponlists:[],
        discouponlists:[],
        shopid:'',
        xianshi:'',
        onecoupon:{
          available: 1,
          condition: '',
          reason: '',
          value: 0,
          name: '',
          startAt: 0,
          endAt: 0,
          valueDesc: '',
          unitDesc: '',
          description:''
        }
      }
    },
    computed: {
      ...mapState(['defaultAddress']),
      goodsPrice() {
        const price = this.goodsInfo.reduce((total, item) => total + item.selectedNum * item.price, 0)
        return parseFloat(price).toFixed(2)
      },
    },
    created() {
        this.paymentIf = this.$route.query.paymentIf
        this.orderId = this.$route.query.orderId
        this.payId = this.$route.query.payId
        if (this.paymentIf == '1') {
            //获取订单信息
            this.getOrderInfo(this.orderId)
        } else {
            // 获取购买商品的ID
            this.zhifu()
            this.goodsId = this.$route.query.data
            this.getInfo(this.goodsId)
            // 默认地址
            if (!this.defaultAddress.name) {
                this.getDefaultAddress()
            }
        }
    },
    methods: {
      ...mapMutations(['updateDefaultAddress']),
        getOrderInfo(orderId){
            this.$request.post('/order/detail/'+orderId,{token: storage.get('token')}).then(res => {
              // console.log(res)
              if (res.code !== 200) {
                    this.$toast(res.message)
                    return
                }
                this.tmd = res.data.receiverDetailAddress
                this.receiverName = res.data.receiverName
                this.phoneNumber = res.data.receiverPhone
                this.TotalPrice = res.data.totalAmount
                this.kkkshop = res.data.orderItemList
              this.youhui = res.data.couponAmount+'元'
            })
        },
      //查看支付方式
      zhifu(){
        const kkk = storage.get('sourceType')
        if(kkk == 1){
          this.xxhh = '华夏银行'
        }
      },
      //获取优惠券
      coupon(){
        this.$request.get('/member/coupon/validCoupon', { token: storage.get('token'),productId:this.shopid}).then(res => {
          // console.log(res)
          let data = res.data.couponlists
          data.forEach(item=>{
            this.couponId = item.id
            this.onecoupon.name = item.couponName
            this.onecoupon.valueDesc = item.amount+'元'
            this.onecoupon.description = item.note
            this.onecoupon.startAt =item.startTime/1000
            this.onecoupon.endAt =item.endTime/1000
            this.onecoupon.condition = '满'+item.minPoint+'可用'
            this.couponlists.push(this.onecoupon)
            this.onecoupon = {}
          })
          this.xianshi = this.couponlists.length+'张可用'
          let datt = res.data.discouponlists
          datt.forEach(item=>{
            this.onecoupon.name = item.couponName
            this.onecoupon.valueDesc = item.amount+'元'
            this.onecoupon.description = item.note
            this.onecoupon.startAt =item.startTime/1000
            this.onecoupon.endAt =item.endTime/1000
            this.onecoupon.condition = '满'+item.minPoint+'可用'
            this.discouponlists.push(this.onecoupon)
            this.onecoupon = {}
          })
        })
    },
      onChange(index) {
        this.showList = false
        this.chosenCoupon = index
        this.xianshi = '-'+this.couponlists[index].valueDesc
        this.jin = parseInt(this.couponlists[index].valueDesc)
        let value = (this.price - this.jin).toString()
       this.TotalPrice = value.substring(0,value.indexOf('.')+3)
          this.componentAmount = this.couponlists[index].valueDesc
      },
      hxpay(){
        var obj = document.getElementById('links')
        obj.href = this.hxpays
        obj.click()
      },
      // 获取购买的商品
      getInfo(goodsId){
             this.$request.get('/shop/shop_a',{id:this.goodsId,token: storage.get('token')}).then(res=>{
               this.ordershop.push(res.data)
               this.price = (this.ordershop[0].price * res.data.selectedNum)
               this.shopid = res.data.goodsId
               this.coupon()
               this.TotalPrice = this.price
               // console.log(this.ordershop)
             })
      },
      onAddressChoose() {
        this.$router.push({ path: '/address-list', query: { isChoose: true }})
      },
      onShowCoupons() {
        this.showList = !this.showList
      },
      // 点击提交订单
      onSubmit() {
        if (this.paymentIf == '1') {
            this.$toast.loading({
                  mask: true,
                  message: '支付提交中',
                  duration: 0
                })
            this.$request.post('/pay/jsPay',{token: storage.get('token'),prepay_id:this.payId}).then(res => {
                const data = res
                WeixinJSBridge.invoke(
                    'getBrandWCPayRequest', {
                        "appId": data.appId,
                        "timeStamp": data.timeStamp,
                        "nonceStr": data.nonceStr,
                        "package": data.package,
                        "signType": data.signType,
                        "paySign": data.paySign,
                    },
                    // function(res){
                    // if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                    //   alert("支付成功")
                    pay_balance(this.orderId, storage.get('token')).then(res => {
                        this.$toast.clear()
                        this.$router.replace({ path: '/order-detail', query: { id: this.orderId }})
                    })
                    // }
                    // }
                )
            })
        } else {
            const sourceType = storage.get('sourceType')
            if(sourceType == 1){
                this.sourceTypes = 1
            }
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
                memberReceiveAddressId:this.defaultAddress.id,
                skuStockId:this.ordershop[0].skuStockId,
                buyerRemain:this.ordershop[0].remark,
                selectedNum:this.ordershop[0].selectedNum,
                goodssp1:this.ordershop[0].sp1,
                goodssp2:this.ordershop[0].sp2,
                payType:this.sourceTypes,
                couponId:this.couponId,
                couponAmount:this.componentAmount
            }
            // console.log(this.defaultAddress.id)
            // console.log(params)
            // 创建订单
            this.createOrder(params)
            this.getDefaultAddress()
        }
      },
      createOrder(params) {
        this.$request.post('/order/createOrder', params).then(res => {
          //华夏支付订单
          this.hxpays = res.data.payUrl
          if(this.sourceTypes == 1){
            // alert(res.data.payUrl)
            this.hxpay()
            return
          }
          //微信支付
          this.paysId = res.data.prepay_id
          if (res.code !== 200) {
            this.$toast(res.message)
            return
          }
          this.$toast(res.message)
          this.$toast.clear()
          const orderResult = res.data
          // 微信支付订单
          this.onPay(orderResult,params)
        })
      },
      // 支付金额
      onPay(orderResult,params) {
        const order = orderResult.order
        const sku = orderResult.orderItem
        const orderId = order.id
        // const amountReal = sku.productPrice
        // console.log(order,sku,orderId,amountReal)
        if (this.isBalancePay) {
          this.$toast.loading({
            mask: true,
            message: '支付提交中',
            duration: 0
          })
            this.$request.post('/pay/jsPay',{token: storage.get('token'),prepay_id:this.paysId}).then(res => {
              // console.log(res)
              const data = res
                WeixinJSBridge.invoke(
                  'getBrandWCPayRequest', {
                    "appId": data.appId,
                    "timeStamp": data.timeStamp,
                    "nonceStr": data.nonceStr,
                    "package": data.package,
                    "signType": data.signType,
                    "paySign": data.paySign,
                  },
                      pay_balance(orderId, storage.get('token')).then(res => {
                        this.$toast.clear()
                        this.$router.replace({ path: '/order-detail', query: { id: orderId,params }})
                    })
                  )
            })
      }
        else {
        // this.removeStorageGoods()
        this.$router.replace({ path: '/order-list/?status=0' })
      }
    },
      // 获取地址
      getDefaultAddress() {
        this.$request.get('/member/address/default',{token: storage.get('token')}).then(res => {
          // console.log(res)
          this.addresid = res.data[0]
          if (res.data.length>0) {
            let info = res.data[0]
            this.defaultAddress.id = info.id
            this.defaultAddress.name = info.name
            this.defaultAddress.phoneNumber = info.phoneNumber
            this.defaultAddress.detailAddress = info.detailAddress
            this.isHasveDeft = true
          }
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

