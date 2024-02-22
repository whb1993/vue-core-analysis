import { effect, track, trigger } from '../effect/index.js'

export const ITERATE_KEY = Symbol('iterate')
const fn = name => {
  console.log('我是：', name)
}
const p2 = new Proxy(fn, {
  // 使用 apply 拦截函数调用
  apply(target, thisArg, argArray) {
    console.log('拦截函数调用')
    target.call(thisArg, ...argArray)
  }
})

// p2('hcy') // 输出：'我是：hcy'

// const obj = {
//   foo: 1,
//   // get bar() {
//   //   return this.foo
//   // }
// }

function reactive(obj1) {
  return new Proxy(obj1, {
    set(target, key, newVal, recevier) {
      const oldVal = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key)
        ? 'SET'
        : 'ADD'
      const res = Reflect.set(target, key, newVal, recevier)
      // 这里同样没有使用 Reflect.set 完成设置
      // target[key] = newVal
      // target === receiver.raw 说明 receiver 就是 target 的代理对象
      if (target === recevier.raw) {
        if (oldVal !== newVal && oldVal === oldVal && newVal === newVal) {
          trigger(target, key, type)
        }
      }

      return res
    },

    deleteProperty(target, key) {
      // 检查被操作的属性是否是对象自己的属性
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      // 使用 Reflect.deleteProperty 完成属性的删除
      const res = Reflect.deleteProperty(target, key)

      if (res && hadKey) {
        // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
        trigger(target, key, 'DELETE')
      }

      return res
    },
    get(target, key, recevier) {
      if (key === 'raw') {
        return target
      }

      const res = Reflect.get(target, key, recevier)
      track(target, key)
      if (typeof res === 'object' && res !== null) {
        // 调用 reactive 将结果包装成响应式数据并返回
        return reactive(res)
      }
      return res
    },

    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    // 处理 in
    ownKeys(target) {
      // 将副作用函数与 ITERATE_KEY 关联
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
    }
  })
}

const obj = {}
const proto = { bar: { a: 1 } }
const child = reactive(obj)
const parent = reactive(proto)
// 使用 parent 作为 child 的原型
Object.setPrototypeOf(child, parent)

effect(() => {
  console.log(parent.bar.a) // 1
})
// 修改 child.bar 的值
parent.bar.a = 2 // 会导致副作用函数重新执行两次

// effect(() => {
//   // for...in 循环
//   for (const key in p) {
//     console.log(p[key]) // foo
//   }
// })

// setTimeout(() => {
//   p.foo = 1
// }, 1000);
