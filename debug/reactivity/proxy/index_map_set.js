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

// const key = { key: 1 }
// const value = new Set([1, 2, 3])
// const p = reactive(new Map([[key, value]]))

// effect(() => {
//   p.forEach(function (value, key) {
//     console.log(value.size) // 3
//   })
// })

// p.get(key).delete(1)

// const m = new Map([
//   ['key1', 'value1'],
//   ['key2', 'value2']
// ])

// for (const [key, value] of m.entries()) {
//   console.log(key, value)
// }
// // 输出：
// // key1 value1
// // key2 value2

// for (const [key, value] of m) {
//   console.log(key, value)
// }
// // 输出：
// // key1 value1
// // key2 value2

// const itr = m[Symbol.iterator]()
// console.log(itr.next()) // { value: ['key1', 'value1'], done: false }
// console.log(itr.next()) // { value: ['key2', 'value2'], done: false }
// console.log(itr.next()) // { value: undefined, done: true }

// console.log(m[Symbol.iterator] === m.entries) // true

// const key = { key: 1 }
// const value = new Set([1, 2, 3])
// const p = reactive(new Map([[key, value]]))

// effect(() => {
//   p.forEach(function (value, key) {
//     console.log(value.size) // 3
//   })

//   // TypeError: p.entries is not a function or its return value is not iterable
//   for (const [key, value] of p.entries()) {
//     console.log(key, value)
//   }
// })

// p.get(key).delete(1)

const p = reactive(
  new Map([
    ['key1', 'value1'],
    ['key2', 'value2']
  ])
)

effect(() => {
  for (const value of p.keys()) {
    console.log(value) // key1 key2
  }
})

p.set('key2', 'value3') // 这是一个 SET 类型的操作，它修改了 key2 的值
