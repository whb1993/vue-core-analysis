import { effect } from '../effect/index.js'
import { reactive } from './index_reactive.js'

// const p = reactive(new Set([1, 2, 3]))

// effect(() => {
//   // 在副作用函数内访问 size 属性
//   console.log(p.size)
// })
// // 添加值为 1 的元素，应该触发响应
// p.add(4)

// const m = new Map([[{ key: 1 }, { value: 1 }]])
// effect(() => {
//   m.forEach(function (value, key, m) {
//     console.log(value) // { value: 1 }
//     console.log(key) // { key: 1 }
//   })
// })

// const p = reactive(new Map([[{ key: 1 }, { value: 1 }]]))

// effect(() => {
//   p.forEach(function (value, key) {
//     console.log(value) // { value: 1 }
//     console.log(key) // { key: 1 }
//   })
// })

// // 能够触发响应
// p.set({ key: 2 }, { value: 2 })

const key = { key: 1 }
const value = new Set([1, 2, 3])
const p = reactive(new Map([[key, value]]))

effect(() => {
  p.forEach(function (value, key) {
    console.log(value.size) // 3
  })
})

p.get(key).delete(1)
