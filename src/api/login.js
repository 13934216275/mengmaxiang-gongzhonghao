import request from '@/common/request'

export function zhuce(data) {
    return request.post('/sso/register', data)
}
export function denglu(data) {
    return request.post('/sso/login', data)
}