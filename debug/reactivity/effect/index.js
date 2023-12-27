/**
 * 用一个全局变量存储 需要执行 副作用函数
 * 多个effect方法 activeEffect 有多个
 * activeEffect.dep 保存依赖的全局set 方便删除
 */
var activeEffect = null

// 原始数据 观测的数据
const data = { text: 'hello world', flag: true }
/**
 * 记录 观测对象 - 关联key - 副作用方法记录 观测对象 - 关联key - 副作用方法
 * 观测对象
 *    key
 *      副作用方法(set 类型的集合)
 */
const bucket = new WeakMap()

/**
 * 记录需要跟踪的值
 * @param {*} target 代理的对象
 * @param {*} key 代理对象关注的key值
 */
const track = (target, key) => {
  if (!bucket.has(target)) {
    bucket.set(target, new Map())
  }
  const keyObj = bucket.get(target)
  if (!keyObj.has(key)) {
    keyObj.set(key, new Set())
  }

  // 记录 副作用 方法
  const set = keyObj.get(key)
  set.add(activeEffect)
  activeEffect.deps.push(set)
}

/**
 * 执行需要更新的值
 * @param {*} 代理的对象
 * @param {*} key 代理对象关注的key值
 */
const trigger = (target, key) => {
  const set = bucket.get(target)?.get(key)

  // 避免删除
  const tem = new Set(set)

  tem && tem.forEach(autoEffectFn => autoEffectFn())
}

// 使用 Proxy 实现 obj代理data的数据变更
const obj = new Proxy(data, {
  get(target, key) {
    // 将 activeEffect 中存储的副作用函数收集到“桶”中
    if (!activeEffect) {
      return target[key]
    }

    track(target, key)
    console.log('run 读取')
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
    console.log('run 修改')
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
function effect(userFn) {
  /**
   * 对用户的副作用进行封装(会执行多次,)
   * 先清空依赖,然后执行副作用,因为读取 所以会重新记录跟踪
   */
  const autoEffectFn = () => {
    console.log('run autoEffectFn')
    cleanEffect(autoEffectFn)
    activeEffect = autoEffectFn
    userFn()
  }
  /**
   * 每个effect 只执行一次
   */
  autoEffectFn.deps = []
  console.log('run effect')
  autoEffectFn()
}

// 注册副作用方法 effect
effect(
  // 一个匿名的副作用函数
  () => {
    console.log('run effect1')
    document.body.innerText = obj.flag ? obj.text : 'not'
  }
)

// 执行 effect
effect(
  // 一个匿名的副作用函数
  () => {
    console.log('run effect2')
    obj.text
  }
)

// 1 秒后修改响应式数据
setTimeout(() => {
  console.log('开始 修改falg 影响effect1')
  obj.flag = false
  console.log('结束 修改falg 影响effect1')
}, 1000)

// 3 秒后修改响应式数据  不应该触发副作用
setTimeout(() => {
  console.log('开始 text  影响effect2')
  obj.text = 'hello vue3'
  console.log('结束 text  影响effect2')
}, 3000)
