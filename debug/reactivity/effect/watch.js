import { effect, obj } from './index.js'

function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue

  // 存储用户过期调用
  let cleanup

  function onInvalidate(fn) {
    cleanup = fn
  }
  const job = () => {
    newValue = effectFn()

    if (cleanup) {
      cleanup()
    }
    // 当数据变化时，调用回调函数 cb
    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }
  const effectFn = effect(
    // 调用 traverse 递归地读取
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

function traverse(value, seen = new Set()) {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  // 将数据添加到 seen 中，代表遍历地读取过了，避免循环引用引起的死循环
  seen.add(value)
  // 暂时不考虑数组等其他结构
  // 假设 value 就是一个对象，使用 for...in 读取对象的每一个值，并递归地调用 traverse 进行处理
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}

// watch(
//   () => obj.bar,
//   (newV, oldV) => {
//     console.log('new:' + newV + 'old:' + oldV)
//   },
//   {
//     immediate: true
//   }
// )

let flag = true

const fetchFn = () => {
  return new Promise(resolve => {
    const num = Math.random()
    const time = !flag ? 1000 : 3000
    console.log('设置时间' + time)
    setTimeout(() => {
      console.log('设置' + num)
      resolve(num)
    }, time)

    flag = false
  })
}
watch(obj, async (newValue, oldValue, onInvalidate) => {
  // 定义一个标志，代表当前副作用函数是否过期，默认为 false，代表没有过期
  let expired = false
  // 调用 onInvalidate() 函数注册一个过期回调
  onInvalidate(() => {
    // 当过期时，将 expired 设置为 true
    expired = true
  })

  // 发送网络请求
  const res = await fetchFn('/path/to/request')
  console.log(expired)

  // 只有当该副作用函数的执行没有过期时，才会执行后续操作。
  if (!expired) {
    console.log(res)
  }
})

obj.bar = 1

setTimeout(() => {
  obj.bar = 2
}, 100)

// setTimeout(() => {
//   obj.bar = 11
// }, 1000)
