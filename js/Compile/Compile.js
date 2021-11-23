const compileUtils = {
    getVal( expr, data ) {
        return expr.split('.').reduce((prev, cur) => {
            return prev[cur]
        }, data)
    },
    setVal(vm, expr, value) {
        expr.split('.').reduce((prev, cur) => {
            if(isObject(prev[cur])) {
                return prev[cur]
            }else {
                return prev[cur] = value
            }
        }, vm._data)

    },
    //获取新值 对{{person.name}}{{person.age}}格式进行处理
    getContentVal(expr, vm){
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getVal(args[1].trim(), vm._data) 
        })
    },
    text(el, expr, vm) {
        let value;
        if(/\{\{(.+?)\}\}/g.test(expr)) {
            value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                new Watcher(vm, args[1].trim(), el, () => {
                    // console.log("Watcher: ", this.getContentVal(expr, vm));
                    this.updated.textUpdater(el, this.getContentVal(expr, vm))
                })
                return this.getVal(args[1].trim(), vm._data)
            })
        }else {
            value = this.getVal(expr, vm._data)
            new Watcher(vm, expr, el, (newValue) => {
                // console.log("Watcher: ", newValue);
                this.updated.textUpdater(el, newValue)
            })
        }

        // console.log(el, expr, value, vm);

        this.updated.textUpdater(el, value)
        // console.log("text：", value);
    },
    html(el, expr, vm) {
        const value = this.getVal(expr, vm._data)

        new Watcher(vm, expr, el, (newValue) => {
            // console.log("Watcher: ", newValue);
            this.updated.htmlUpdater(el, newValue)
        })
        this.updated.htmlUpdater(el, value)
        // console.log("html：", value);
    },
    model(el, expr, vm) {
        const value = this.getVal(expr, vm._data)
        // 数据更新视图
        new Watcher(vm, expr, el, (newValue) => {
            this.updated.modelUpdater(el, newValue)
        })

        // 双向绑定 视图==>数据==>视图
        el.addEventListener('input', (e) => {
            // 设置数据
            this.setVal(vm, expr, e.target.value)
        }, false)

        this.updated.modelUpdater(el, value)
    },
    bind(el, expr, vm, event) {
        const value = this.getVal(expr, vm._data)
        new Watcher(vm, expr, el, (newValue) => {
            this.updated.bindUpdater(el, newValue, event)
        })
        this.updated.bindUpdater(el, value, event)
    },
    on(el, expr, vm, event) {
        const fn = vm.$options.methods && vm.$options.methods[expr]
        if(fn) {
            el.addEventListener(event, fn.bind(vm), false)
        }
    },

    // 更新视图
    updated: {
        // 更新html
        htmlUpdater(el, value) {
            el.innerHTML = value
        },
        // 更新text
        textUpdater(el, value) {
            el.textContent = value
        },
        modelUpdater(el, value) {
            el.value = value
        },
        bindUpdater(el, value, event) {
            // 添加标签属性
            el.setAttribute(event, value)
        }
    },
}

// 指令解析
class Compile{
    constructor(el, vm) {
        this.vm = vm
        this.$el = isElementNode(el) ? el : document.querySelector(el)

        // 创建文档碎片来进行缓存，用于减少页面的回流和重绘，
        // 因为每次匹配到进行替换时,会导致页面的回流和重绘,影响页面的性能
        const fragment = this.nodeFragment(this.$el)

        // 编译模板
        this.compile(fragment)

        // 把元素追加到根节点
        this.$el.appendChild(fragment)
    }

    compileElement(node) {
        const attrs = node.attributes;
        [...attrs].forEach(attr => {
            const { name, value } = attr
            if(isDirective(name)) {
                const [, dir] = name.split('-')
                const [dirName,event] = dir.split(':')
                // 更新数据
                compileUtils[dirName](node, value, this.vm, event)
                // 更新页面后删除元素中的指令
                node.removeAttribute(name)
            }
        });
    }

    // 处理文本节点元素 ==> {{ person.name }}
    compileText(textNode) {
        const content = textNode.textContent
        if(/\{\{(.+?)\}\}/.test(content)) {
            compileUtils['text'](textNode, content, this.vm)
        }
    }

    compile(node) {
        const childNodes = node.childNodes
        childNodes.forEach(node => {
            if(isElementNode(node)) {
                // 节点元素
                this.compileElement(node)
            }else{
                // 文本元素
                this.compileText(node)
            }
            // 递归遍历节点
            if(node.childNodes?.length) {
                this.compile(node)
            }
        });
    }

    nodeFragment(el) {
        const fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment
    }
}