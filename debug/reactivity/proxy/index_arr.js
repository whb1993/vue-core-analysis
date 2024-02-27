import { reactive } from './index_reactive.js'

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

// const obj = {}
// const arr = reactive([obj])

// console.log(arr.includes(arr[0])) // true
// console.log(arr.includes(obj)) // true

// 普通对象的读取和设置操作
const obj = { foo: 1 }
obj.foo // 读取属性
obj.foo = 2 // 设置属性

// 用 get/set 方法操作 Map 数据
const map = new Map()
map.set('key', 1) // 设置数据
map.get('key') // 读取数据
const arr = reactive([obj])
console.log(arr) // true
