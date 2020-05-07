<template>
  <div class="contaienr">
    <van-address-edit :address-info="addressInfo"
      :area-list="areaList"
      show-postal
      :show-delete="status==1"
      show-set-default
      @save="onSave"
      @delete="onDelete" />
  </div>
</template>

<script>
import { AddressEdit } from 'vant'
import areaList from '@/common/area'
import { storage } from '@/common/util'
import { isEmpty } from '@/common/validate'

export default {
  components: {
    [AddressEdit.name]: AddressEdit
  },
  data() {
    return {
      id:'',
      status: 0, // 0添加地址,1修改地址
      addressInfo: {},
      areaList: areaList,
      searchResult: []
    }
  },
  created() {
    this.id = this.$route.query.id
    if (this.id) {
      this.status = 1
      this.$request.get('/member/address/'+this.$route.query.id,{token: storage.get('token'),}).then(res => {
        this.addressInfo = {
          id: res.data.id,
          name: res.data.name,
          tel: res.data.phoneNumber,
          province: res.data.province,  // 省
          city: res.data.city,       // 市
          county: res.data.region, //  区
          addressDetail: res.data.detailAddress, //详细地址
          isDefault: res.data.defaultStatus==null?false:res.data.defaultStatus, //默认状态
          postalCode: res.data.postCode,
          areaCode: res.areaCode
        }
      })
    }
  },
  methods: {
    onSave(form) {
      // console.log(form)
      if (isEmpty(form.postalCode)) {
        this.$toast('请填写邮政编码')
        return
      }
      this.updateAddress(form)
    },
    updateAddress(form) {
      let addressAction = 'update'; let params = {}
      this.$route.query.id ? addressAction = 'update' : addressAction = 'add'
      params = {
        id: this.$route.query.id,
        token: storage.get('token'),
        name: form.name,
        phoneNumber: form.tel,
        province: form.province,  // 省
        city: form.city,       // 市
        region: form.region, //  区
        detailAddress:form.province+(form.city===form.province ? '' : form.city)+(form.county===form.city ? '' : form.county)+ form.addressDetail, //详细地址
        defaultStatus: form.isDefault, //默认状态
        postCode: form.postalCode,
        areaCode: form.areaCode
      }
      alert(params.areaCode)
      this.$toast.loading({
        mask: true,
        message: '地址数据提交中...',
        duration: 0
      })
      this.$request.post(`/member/address/${addressAction}/`,params).then(res => {
        // 已参团不做处理，提交订单时后端会提示
        if (res.code !== 200) {
          this.$toast(res.message)
          return
        }
        this.$toast.clear()
        this.$router.go(-1)
      })
    },
    deleteAddress(params) {
      this.$toast.loading({
        mask: true,
        message: '地址数据提交中...',
        duration: 0
      })
      this.$request.post('/member/address/delete/'+this.id,{token: storage.get('token'),}).then(res => {
        if (res.code !== 200) {
          this.$toast(res.message)
        }
        this.$toast(res.message)
        this.$toast.clear()
        this.$router.go(-1)
      })
    },
    onDelete() {
      this.deleteAddress({
        token: storage.get('token'),
        id: this.addressInfo.id
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>

