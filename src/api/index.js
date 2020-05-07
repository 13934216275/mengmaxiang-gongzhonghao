import request from '@/common/request'

export function getGoodsList(data) {
    return request.post('/home/recommendProductList', data)
}
export function getbanner(data) {
    return request.post('/home/recommendProductList', data)
}
