import { arrayInstrumentations, track, trigger } from '../effect/index.js'

export const ITERATE_KEY = Symbol('iterate')
// const fn = name => {
//   console.log('我是：', name)
// }
// const p2 = new Proxy(fn, {
//   // 使用 apply 拦截函数调用
//   apply(target, thisArg, argArray) {
//     console.log('拦截函数调用')
//     target.call(thisArg, ...argArray)
//   }
// })

// p2('hcy') // 输出：'我是：hcy'

// const obj = {
//   foo: 1,
//   // get bar() {
//   //   return this.foo
//   // }
// }

// 定义一个 Map 实例，存储原始对象到代理对象的映射
const reactiveMap = new Map()

function reactive(obj1, isShallow = false, isReadonly = false) {
  // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，直接返回已有的代理对象
  const existionProxy = reactiveMap.get(obj)
  if (existionProxy) return existionProxy

  // 否则，创建新的代理对象
  const proxy = new Proxy(obj1, {
    set(target, key, newVal, recevier) {
      if (isReadonly) {
        console.warn(`属性${key}只读`)
        return true
      }
      const oldVal = target[key]

      // 如果属性不存在，则说明是在添加新的属性，否则是设置已有属性
      const type = Array.isArray(target)
        ? // 如果代理目标是数组，则检测被设置的索引值是否小于数组长度，
          // 如果是，则视作 SET 操作，否则是 ADD 操作
          Number(key) < target.length
          ? 'SET'
          : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key)
        ? 'SET'
        : 'ADD'

      const res = Reflect.set(target, key, newVal, recevier)
      // 这里同样没有使用 Reflect.set 完成设置
      // target[key] = newVal
      // target === receiver.raw 说明 receiver 就是 target 的代理对象
      if (target === recevier.raw) {
        if (oldVal !== newVal && oldVal === oldVal && newVal === newVal) {
          trigger(target, key, type, newVal)
        }
      }

      return res
    },

    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性${key}只读`)
        return true
      }
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

      // 如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 上，
      // 那么返回定义在 arrayInstrumentations 上的值
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }

      const res = Reflect.get(target, key, recevier)
      // 非只读的时候 添加跟踪 symbol 不追踪
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }

      if (isShallow) {
        return res
      }
      // 处理对象多层问题 将每层数据都改为响应式
      if (typeof res === 'object' && res !== null) {
        // 调用 reactive 将结果包装成响应式数据并返回
        return reactive(res, isShallow, isReadonly)
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
      // track(target, ITERATE_KEY)
      // 如果操作目标 target 是数组，则使用 length 属性作为 key 并建立响应联系
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
      return Reflect.ownKeys(target)
    }
  })

  // 存储到 Map 中，从而避免重复创建
  reactiveMap.set(obj, proxy)
  return proxy
}

// const obj = {}
// const proto = { bar: { a: 1 } }
// const child = reactive(obj)
// const parent = reactive(proto)
// // 使用 parent 作为 child 的原型
// Object.setPrototypeOf(child, parent)

// effect(() => {
//   console.log(parent.bar.a) // 1
// })
// // 修改 child.bar 的值
// parent.bar.a = 2 // 会导致副作用函数重新执行两次

// effect(() => {
//   // for...in 循环
//   for (const key in p) {
//     console.log(p[key]) // foo
//   }
// })

// setTimeout(() => {
//   p.foo = 1
// }, 1000);

// const a = [1]
// const arr = reactive(a)
// effect(() => {
//   console.log(arr[0]) // 1
// })
// // 修改 child.bar 的值
// // arr[0] = 2 // 会导致副作用函数重新执行两次
// arr.length = 0

// const arr = reactive([1, 2])

// effect(() => {
//   console.log(arr.includes(1)) // 初始打印 true
// })

// arr[0] = 3 // 副作用函数重新执行，并打印 false

const obj = {}
const arr = reactive([obj])

console.log(arr.includes(arr[0])) // true
console.log(arr.includes(obj)) // true
