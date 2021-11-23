class Watcher{
    constructor(vm, exps, el, cb) {
        this.vm = vm
        this.exps = exps
        this.cb = cb
        this.oldValue = this.getOldValve()
        this.el = el
    }
    // 更新操作 数据变化后 Dep会发生通知 告诉观察者更新视图
    update() {
        const newValue = compileUtils.getVal(this.exps, this.vm._data);
        // console.log("newValue：", newValue, "oldValue：", this.oldValue);
        if(newValue !== this.oldValue) {
            this.cb(newValue)
        }
        // 更新视图后 更新旧值
        this.oldValue = newValue
    }
    getOldValve() {
        Dep.target = this
        const oldValue = compileUtils.getVal(this.exps, this.vm._data);
        Dep.target = undefined
        return oldValue
        
    }
}