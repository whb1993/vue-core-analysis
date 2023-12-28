import { effect, obj, track, trigger } from './index.js'

function computed(getter) {
  let value
  let dirty = true
  // 把 getter 作为副作用函数，创建一个 lazy 的 effect
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true
        console.log('run effect')
        trigger(obj, 'value')
      }
    }
  })

  const objTem = {
    // 当读取 value 时才执行 effectFn
    get value() {
      if (dirty) {
        value = effectFn()
        track(obj, 'value')
        dirty = false
      }
      return value
    }
  }

  return objTem
}

const sumRes = computed(() => {
  return obj.foo + obj.bar
})

effect(() => {
  // 在该副作用函数中读取 sumRes.value
  console.log(sumRes.value)
})

// 修改 obj.foo 的值
obj.foo++
