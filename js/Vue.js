class Vue{
    constructor(options) {
        this.$options = options
        this.$el =  options.el
        this._init()
    }
    _init() {
        this.initState(this.$options, () => {
            const computedIns = this.initComputed(this, this.$options.computed)
            const watcherIns = this.initWatcher(this, this.$options.watch)
            this.$computed = computedIns.update.bind(computedIns)
            this.$watcher = watcherIns.updata.bind(watcherIns)
        })
        
    }

    initState(options, cb) {
        let { data } = options
        const vm = this
        data = vm._data = isFunc(data) ? data() : data

        new Observer(data, (key) => {
        }, (key, newValue, oldValue) => {
            console.log("更新数据", "key：", key, "新值：", newValue, "旧值：", oldValue);
            this.$computed(key, this.$watcher)
            this.$watcher(key, newValue, oldValue)
        })
        
        new Proxy(vm, data, '_data')
        cb && cb()
        new Compile(this.$el, vm)
    }

    initComputed(vm, computed) {
        const computedIns = new Computed()
        for (const key in computed) {
            if (Object.hasOwnProperty.call(computed, key)) {
                computedIns._addComputed(vm, computed, key)
            }
        }
        return computedIns
    }

    initWatcher(vm, watchers) {
        const watcherIns = new Watch()
        for (const key in watchers) {
            if (Object.hasOwnProperty.call(watchers, key)) {
                watcherIns._addWatcher(vm, watchers, key)
            }
        }
        return watcherIns
    }
}



