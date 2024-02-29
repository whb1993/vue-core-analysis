import { effect } from '../effect/index.js'
import { reactive } from '../proxy/index_reactive.js'

// 封装一个 ref 函数
// function ref(val) {
//   // 在 ref 函数内部创建包裹对象
//   const wrapper = {
//     value: val
//   }
//   // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
//   Object.defineProperty(wrapper, '__v_isRef', {
//     value: true
//   })

//   // 将包裹对象变成响应式数据
//   return reactive(wrapper)
// }

// // 创建原始值的响应式数据
// const refVal = ref(1)

// effect(() => {
//   // 在副作用函数内通过 value 属性读取原始值
//   // console.log(refVal.value)
// })
// // 修改值能够触发副作用函数重新执行
// refVal.value = 2

// // obj 是响应式数据
// const obj = reactive({ foo: 999, bar: 2 })
// // 将响应式数据展开到一个新的对象 newObj
// const newObj = {
//   ...obj
// }
// effect(() => {
//   // 在副作用函数内通过新的对象 newObj 读取 foo 属性值
//   console.log(newObj.foo)
// })
// // 很显然，此时修改 obj.foo 并不会触发响应
// newObj.foo = 666

// obj 是响应式数据
// const obj = reactive({ foo: 1, bar: 2 })
const obj = reactive({ foo: 1, bar: 2 })

function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    },
    // 允许设置值
    set value(val) {
      obj[key] = val
    }
  }

  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })

  return wrapper
}

function toRefs(obj) {
  const ret = {}
  // 使用 for...in 循环遍历对象
  for (const key in obj) {
    // 逐个调用 toRef 完成转换
    ret[key] = toRef(obj, key)
  }
  return ret
}
const newObj = { ...toRefs(obj) }

effect(() => {
  // 在副作用函数内通过新的对象 newObj 读取 foo 属性值
  console.log(newObj.foo.value)
})

const refFoo = toRef(obj, 'foo')

refFoo.value = 100 // 无效

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      return value.__v_isRef ? value.value : value
    },
    set(target, key, newValue, receiver) {
      // 通过 target 读取真实值
      const value = target[key]
      // 如果值是 Ref，则设置其对应的 value 属性值
      if (value.__v_isRef) {
        value.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    }
  })
}
// 调用 proxyRefs 函数创建代理
const newObj1 = proxyRefs({ ...toRefs(obj) })

console.log('new ' + newObj1.foo)
