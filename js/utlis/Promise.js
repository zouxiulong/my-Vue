
function resolveResult(x, promise2, resolve, reject) {
    // 判断是否返回了当前的Promise, 如果是则返回一个错误
    if(x === promise2){
        return reject(new TypeError('循环返回了'))
    }
    if((typeof x === 'object' && x !== null) || typeof x === 'function') {
        try{
            let then = x.then
            if(typeof then === 'function') {
                then.call(x, res => {
                    // 返回的依然是不确定的 所以要递归调用
                    resolveResult(res, promise2, resolve, reject)
                }, err => {
                    // 失败，就传入失败原因
                    reject(err)
                })
            }else {
                resolve(x)
            }
        } catch(err) {
            reject(err)
        }
    }else {
        resolve(x)
    }
}


class myPromise{
    _status = "pending"
    _value = undefined
    _reason = undefined
    _this = undefined
    _fulfulledCallBack = []
    _rejectedCallBack = []
    constructor(fn) {
        const resolve = (value) => {
            if(this._status === 'pending') {
                this._value = value
                this._status = 'fulfilled'
                this._fulfulledCallBack.length && this._fulfulledCallBack.forEach(cb => {
                    cb()
                })
            }
        }
    
        const reject = (reason) => {
            if(this._status === 'pending') {
                this._reason = reason
                this._status = 'rejected'
                this._rejectedCallBack.length &&  this._rejectedCallBack.forEach(cb => {
                    cb()
                })
            }
        }
        try{
            fn(resolve, reject)
        } catch (error) {
            reject(error)
        }

    }

    then(onFulfilled, onRejected) {
        // 给与then方法默认参数
        // 如果没有第一个参数或者第一个参数不是函数，那么就返回当前传入的数据
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : data => data
        // 如果没有第二个参数或者第二个参数不是函数，那么将数据当作异常抛出
        // 因为失败的返回走的是下一个then的成功，所以要抛出才能走失败
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }

        const promise2 = new Promise((resolve, reject) => {
            if(this._status === 'fulfilled') {
                setTimeout(() => {
                    let x = onFulfilled(this._value)
                    resolveResult(x, promise2, resolve, reject)
                }, 0)

            }
            if(this._status === 'rejected') {
                setTimeout(() => {
                    let x = onRejected(this._reason)
                    resolveResult(x, promise2, resolve, reject)
                }, 0)
            }
            if(this._status === 'pending') {
                this._fulfulledCallBack.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this._value)
                            resolveResult(x, promise2, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    },0)
                })
                this._rejectedCallBack.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this._reason)
                            resolveResult(x, promise2, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    },0)
                })
            }
        })
        return promise2
    }
    catch(onRejected) {
        this.then(undefined, onRejected)
    }

    static resolve(value) {
        return new myPromise((resolve, reject) => {
           resolve(value)
        })
    }

    static reject(value) {
        return new myPromise((resolve, reject) => {
           reject(value)
        })
    }
}

let abcd = myPromise
