class Watch {
    constructor() {
        this.watcherDate = []
    }

    _addWatcher(vm, watchers, key) {
        const watchItem = Object.getOwnPropertyDescriptor(watchers, key),
              watchFn = watchItem.value.handler ? watchItem.value.handler : watchItem.value,
              fn = watchFn.bind(vm)   
        
        this._addWatcherProp({
            key,
            fn
        })

    }

    _addWatcherProp(watcherProp) {
        this.watcherDate.push(watcherProp)
    }

    updata(key, newValue, oldValue) {
        this.watcherDate.forEach(watch => {
            if(watch.key === key) {
                watch.fn(newValue, oldValue)
            }
        })
    }
}