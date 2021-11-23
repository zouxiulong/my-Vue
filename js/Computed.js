class Computed {
    constructor() {
        this.computedData = []
    }

    _getComputedDep(fn) {
        return fn.toString().match(/this\.(.+?)/g).map(item => item.split('.')[1])
    }

    _addComputed(vm, computed, key) {
        const computedInfo = Object.getOwnPropertyDescriptor(computed, key),
              computedFn = computedInfo.value.get ? computedInfo.value.get : computedInfo.value,
              get = computedFn.bind(vm),
              value = computedFn.call(vm),
              dap = this._getComputedDep(computedFn)
        this._addComputedProp({
            key,
            get,
            value,
            dap,
            compileDep: new Dep()
        })

        const dataItem = this.computedData.find(item => item.key == key)

        this.defineReactive(vm._data, key, dataItem)

        Object.defineProperty(vm, key, {
            get() {
                return dataItem.value
            },
            set(newValue) {
                if(dataItem.value === newValue) return
                dataItem.value = dataItem.get()
            }
        })
    }

    defineReactive(data, key, dataItem) {
        Object.defineProperty(data, key, {
            get() {
                Dep.target && dataItem.compileDep.addSubs(Dep.target)
                return dataItem.value
            },
            set(newValue) {
                if(dataItem.value === newValue) return
                dataItem.value = dataItem.get()
            }
        })
    }
    update(key, cb) {
        this.computedData.map(item => {
            const dap = item.dap
            const _key = dap.find(el => el === key)
            if(_key) {
                const oldValue = item.value
                item.value = item.get()
                item.compileDep.notify()
                cb && cb(item.key, item.value, oldValue)
            }
            
        })
    }

    _addComputedProp(computedProp) {
        this.computedData.push(computedProp)
    }
}