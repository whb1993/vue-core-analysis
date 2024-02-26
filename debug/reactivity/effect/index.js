import { ITERATE_KEY } from '../proxy/index.js'
/**
 * 用一个全局变量存储 需要执行 副作用函数
 * 多个effect方法 activeEffect 有多个
 * activeEffect.dep 保存依赖的全局set 方便删除
 */
var activeEffect = null
// 使用栈 存储 activeEffect 避免嵌套导致activeEffect找不到
var effectStack = []

// 原始数据 观测的数据
const data = { text: 'hello world', flag: true, foo: 0, bar: 0, num: 0 }
/**
 * 记录 观测对象 - 关联key - 副作用方法记录 观测对象 - 关联key - 副作用方法
 * 观测对象
 *    key
 *      副作用方法(set 类型的集合)
 */
const bucket = new WeakMap()

export const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args) {
    // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args)

    if (res === false || res === -1) {
      // res 为 false 说明没找到，通过 this.raw 拿到原始数组，再去其中查找，并更新 res 值
      res = originMethod.apply(this.raw, args)
    }
    // 返回最终结果
    return res
  }
})

// 一个标记变量，代表是否进行追踪。默认值为 true，即允许追踪
let shouldTrack = true
// 重写数组的 push 方法
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  // 取得原始 push 方法
  const originMethod = Array.prototype[method]
  // 重写
  arrayInstrumentations[method] = function (...args) {
    // 在调用原始方法之前，禁止追踪
    shouldTrack = false
    // push 方法的默认行为
    let res = originMethod.apply(this, args)
    // 在调用原始方法之后，恢复原来的行为，即允许追踪
    shouldTrack = true
    return res
  }
})

/**
 * 记录需要跟踪的值
 * @param {*} target 代理的对象
 * @param {*} key 代理对象关注的key值
 */
export const track = (target, key) => {
  if (!bucket.has(target)) {
    bucket.set(target, new Map())
  }
  const keyObj = bucket.get(target)
  if (!keyObj.has(key)) {
    keyObj.set(key, new Set())
  }

  console.log('运行track 更新 activeEffect.dep')
  // 记录 副作用 方法
  const set = keyObj.get(key)
  set.add(activeEffect)
  if (shouldTrack) {
    activeEffect?.deps.push(set)
  }
}

/**
 * 执行需要更新的值
 * @param {*} 代理的对象
 * @param {*} key 代理对象关注的key值
 */
export const trigger = (target, key, type, newVal) => {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const set = depsMap.get(key)

  const inerateEffects = depsMap.get(ITERATE_KEY)

  // 避免删除
  const tem = new Set(set)

  console.log('运行trigger  执行autoEffectFn(会重新读取并且重置 activeEffect)')

  const needRun = new Set()

  tem &&
    tem.forEach(autoEffectFn => {
      if (autoEffectFn !== activeEffect) {
        needRun.add(autoEffectFn)
      }
    })

  if (type === 'ADD' || type === 'DELETE') {
    inerateEffects &&
      inerateEffects.forEach(autoEffectFn => {
        if (autoEffectFn !== activeEffect) {
          needRun.add(autoEffectFn)
        }
      })
  }

  // 当操作类型为 ADD 并且目标对象是数组时，应该取出并执行那些与 length 属性相关联的副作用函数
  if (type === 'ADD' && Array.isArray(target)) {
    // 取出与 length 相关联的副作用函数
    const lengthEffects = depsMap.get('length')
    // 将这些副作用函数添加到 effectsToRun 中，待执行
    lengthEffects &&
      lengthEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          needRun.add(effectFn)
        }
      })
  }

  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target) && key === 'length') {
    // 对于索引大于或等于新的 length 值的元素，
    // 需要把所有相关联的副作用函数取出并添加到 effectsToRun 中待执行
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            needRun.add(effectFn)
          }
        })
      }
    })
  }

  needRun.forEach(autoEffectFn => {
    // 如果有调度器
    if (autoEffectFn.option.scheduler) {
      autoEffectFn.option.scheduler(autoEffectFn)
    } else {
      autoEffectFn()
    }
  })
}

// 使用 Proxy 实现 obj代理data的数据变更
export const obj = new Proxy(data, {
  get(target, key) {
    // 将 activeEffect 中存储的副作用函数收集到“桶”中
    if (!activeEffect) {
      return target[key]
    }

    track(target, key)
    console.log('run-基础 读取')
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
    console.log('run-基础 修改')
    return true
  }
})

// 清空依赖, 每次修改都会清空
function cleanEffect(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

/**
 * effect 函数用于注册副作用函数
 * @param {*} userFn 用户需要多次执行的副作用
 */
export function effect(userFn, option = {}) {
  /**
   * 对用户的副作用进行封装(会执行多次,)
   * 先清空依赖,然后执行副作用,因为读取 所以会重新记录跟踪
   */
  const autoEffectFn = () => {
    console.log('run-基础 autoEffectFn')
    cleanEffect(autoEffectFn)
    activeEffect = autoEffectFn
    effectStack.push(autoEffectFn)
    const res = userFn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  /**
   * 每个effect 只执行一次
   */
  autoEffectFn.deps = []
  autoEffectFn.option = option
  console.log('run-基础 effect')
  // 懒执行
  if (!option.lazy) {
    autoEffectFn()
  }
  return autoEffectFn
}

// // 注册副作用方法 effect
// effect(
//   // 一个匿名的副作用函数
//   () => {
//     console.log('run-基础 effect1')
//     document.body.innerText = obj.flag ? obj.text : 'not'
//   }
// )

// // 执行 effect
// effect(
//   // 一个匿名的副作用函数
//   () => {
//     console.log('run-基础 effect2')
//     obj.text
//   }
// )

// // 1 秒后修改响应式数据
// setTimeout(() => {
//   console.log('开始 修改falg 影响effect1')
//   obj.flag = false
//   console.log('结束 修改falg 影响effect1')
// }, 1000)

// // 3 秒后修改响应式数据  不应该触发副作用
// setTimeout(() => {
//   console.log('开始 text  影响effect2')
//   obj.text = 'hello vue3'
//   console.log('结束 text  影响effect2')
// }, 3000)
