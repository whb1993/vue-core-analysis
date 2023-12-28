import { effect, obj } from './index.js'

// 全局变量
let temp1, temp2

// effectFn1 嵌套了 effectFn2
effect(function effectFn1() {
  console.log('effectFn1 执行')

  effect(function effectFn2() {
    console.log('effectFn2 执行')
    // 在 effectFn2 中读取 obj.bar 属性
    temp2 = obj.bar
    console.log('temp2' + temp2)
  })
  // 在 effectFn1 中读取 obj.foo 属性
  temp1 = obj.foo
  console.log('temp1' + temp1)
  obj.num++
})

setTimeout(() => {
  obj.num++
}, 1000)
