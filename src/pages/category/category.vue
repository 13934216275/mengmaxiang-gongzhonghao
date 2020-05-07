<template>
    <div class="category">
        <!--搜索框-->
        <form action="/">
            <van-search
                    v-model="value"
                    placeholder="请输入搜索关键词"
                    show-action
                    @search="onSearch"
                    @cancel="onCancel"
            />
        </form>
        <!--分类-->
        <van-tree-select
                height="560px"
                :items="items"
                :main-active-index.sync="activeIndex"
                @click-nav="onclickNav"
        >
            <template slot="content" style="padding: 0 0 100px 0">
                <div v-if="activeIndex == activeIndex">
                    <van-tabs title-active-color="#ff6700" @click="onClick">
                        <van-tab v-for="item in categorydatas"
                                 :key="item.id"
                                 :title="item.name"
                        >
                        </van-tab>
                        <van-card
                                v-for="res in shop"
                                :price="res.price"
                                :desc="res.description"
                                :title="res.detailTitle"
                                :thumb="res.pic"
                                :origin-price="res.originalPrice"
                        >
                            <div slot="tags">
                                <van-button size="mini" style="float: right;background: #ff4444;color: #fff" @click="goshoping(res.id)">购买</van-button>
                            </div>
                        </van-card>
                    </van-tabs>
                </div>
            </template>
        </van-tree-select>
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
    </div>
</template>

<script>
    import { TreeSelect, Card, Tab, Tabs, Search, Tabbar, TabbarItem } from 'vant'
    export default {
        components: {
            [TreeSelect.name]: TreeSelect,
            [Card.name]: Card,
            [Tab.name]: Tab,
            [Tabs.name]: Tabs,
            [Search.name]: Search,
            [Tabbar.name]: Tabbar,
            [TabbarItem.name]: TabbarItem
        },
        data() {
            return {
                activeIndex: 0, //分类默认选中值
                items: [],  //一级分类列表
                value:'',    //搜索框的值
                active: 0,  // 导航默认选中值
                categoryid:1,  // 一级分类的id
                categorydata:[],  //一级分类的数据
                categorydatas:[],   //二级分类的数据
                twocategoryid:'', //二级分类的第一个id
                shop:[],    //商品
                twocategoryids:''    //点击二级分类得到的id
            }
        },
        created(){
            this.getcategory()
        },
        methods:{
            //点击购买按钮
            goshoping(id){
                this.$router.push({ path: '/goods-detail', query: { id }})
            },
            // 其他
            onSearch(){},
            onCancel(){},
            //获取一级分类
            getcategory(){
                this.$request.get('/category/list').then(res => {
                    this.categorydata = res.data;
                    const firstcategory = res.data;
                    firstcategory.forEach(item=>{
                        let catrgory = {text:''};
                        catrgory.text = item.name;
                        this.items.push(catrgory)
                    });
                    this.kkk()
                })
            },
            //获取默认的数据
            async kkk(){
                //第一个一级分类的二级分类
                this.categoryid = this.categorydata[0].id;
                await this.$request.get('/category/list',{parentId:this.categoryid}).then(res => {
                    this.categorydatas = res.data;
                    const xxhh = res.data;
                    this.twocategoryid = xxhh[0].id
                });
                //获取默认的第一个二级分类的商品
                this.$request.get('/shop/category',{categoryId:this.twocategoryid}).then(res => {
                    this.shop = res.data;
                })
            },
            //获取所有一级分类的二级分类
          async  onclickNav(index){
                this.activeIndex = index;
                this.categoryid = this.categorydata[index].id;
              await  this.$request.get('/category/list',{parentId:this.categoryid}).then(res => {
                    this.categorydatas = res.data;
                    const xxhh = res.data;
                    this.twocategoryid = xxhh[0].id
                });
                // //第一个二级分类的商品
                this.$request.get('/shop/category',{categoryId:this.twocategoryid}).then(res => {
                    this.shop = res.data;
                })
            },
            //获取每个二级分类下的商品
            onClick(name, title) {
                this.twocategoryids = this.categorydatas[name].id;
                this.$request.get('/shop/category',{categoryId:this.twocategoryids}).then(res => {
                    this.shop = res.data;
                });

            }
        },
    }
</script>

<style scoped>
    .van-card{
        padding: 0.16rem 0.2rem;
    }
    .van-tab{

    }
</style>

