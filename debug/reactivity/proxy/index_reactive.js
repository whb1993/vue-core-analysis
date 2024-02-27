import {
  arrayInstrumentations,
  mutableInstrumentations,
  track,
  trigger
} from '../effect/index.js'

export const ITERATE_KEY = Symbol('iterate')
// 定义一个 Map 实例，存储原始对象到代理对象的映射
const reactiveMap = new Map()

export function reactive(obj, isShallow = false, isReadonly = false) {
  // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，直接返回已有的代理对象
  const existionProxy = reactiveMap.get(obj)
  if (existionProxy) return existionProxy

  // 否则，创建新的代理对象
  const proxy = new Proxy(obj, {
    set(target, key, newVal, receiver) {
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

      const res = Reflect.set(target, key, newVal, receiver)
      // 这里同样没有使用 Reflect.set 完成设置
      // target[key] = newVal
      // target === receiver.raw 说明 receiver 就是 target 的代理对象
      if (target === receiver.raw) {
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
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }

      if (key === 'size') {
        // 调用 track 函数建立响应联系
        track(target, ITERATE_KEY)
        return Reflect.get(target, key, target)
      }

      // 如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 上，
      // 那么返回定义在 arrayInstrumentations 上的值
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }

      // const res = Reflect.get(target, key, receiver)
      const res = target[key].bind(target)
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
      return mutableInstrumentations[key]
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
