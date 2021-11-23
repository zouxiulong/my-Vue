class Dep{
    constructor() {
        // 依赖收集容器
        this.subs = []
    }
    addSubs(watcher) {
        // 收集依赖
        this.subs.push(watcher)
    }
    notify() {
        // 通知依赖更新试图
        this.subs.forEach(w => w.update())
    }
}

// 代理，通过this直接访问和修改数据
class Proxy{
    constructor(vm, data, target) {
        this.init(vm, data, target)
    }
    init(vm, data, target){
        if(!isObject(data) && typeof data === 'string') {
            this.defineReactive(vm, target, key)
        }else {
            Object.keys(data).forEach(key => {
                this.defineReactive(vm, target, key)
            })
        }
    }
    defineReactive(vm, target, key) {
        Object.defineProperty(vm, key, {
            get() {
                return vm[target][key]
            },
            set(newValue) {
                if(vm[target][key] === newValue) return
                vm[target][key] = newValue
            }
        })
    }
}

// 数据监听
class Observer{
    constructor(data, __get__, __set__) {
        this.__get__ = __get__
        this.__set__ = __set__
        // this.vm = vm
        this.observe(data)
    }
    observe(data) {
        
        if(data && isObject(data)) {
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key])
            })
        }
    }

    defineReactive(data, key, value) {
        this.observe(value)
        const dep = new Dep()
        Object.defineProperty(data, key, {
            get: () => {
                // 收集依赖 
                this.__get__ && this.__get__(key)
                Dep.target && dep.addSubs(Dep.target)
                return value
            },
            set: (newValue) => {
                if(newValue === value) return
                const oldValue = value
                value = newValue
                this.__set__ && this.__set__(key, newValue, oldValue)
                this.observe(newValue)
                dep.notify()
            }
        })
    }

}