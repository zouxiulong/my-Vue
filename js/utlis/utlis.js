function isFunc(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]'
}
function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}
function isElementNode(node){
    // 判断是否是元素节点
    return node.nodeType === 1
}
function isDirective(attrName) {
    return attrName.startsWith('v-')
}