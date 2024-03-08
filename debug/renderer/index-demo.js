import { renderer } from './index.js'
const { effect, ref } = VueReactivity

const bol = ref(false)

effect(() => {
  // 创建 vnode
  const vnode111 = {
    type: 'div',
    props: bol.value
      ? {
          id: '1'
        }
      : { id: '2' },
    children: [
      {
        type: 'p',
        props: {
          onClick: () => {
            bol.value = true
          }
        },
        children: 'text1'
      }
    ]
  }
  console.log(vnode111)
  // 渲染 vnode
  // renderer.render(vnode, document.querySelector('#app'))
})

// 文本节点的 type 标识
const newVNode = {
  // 描述文本节点
  type: 'Text',
  children: '我是文本内容'
}
// 注释节点的 type 标识
const newVNode1 = {
  // 描述注释节点
  type: 'Comment',
  children: '我是注释内容'
}

const vnode = {
  type: 'Fragment',
  children: [
    { type: 'li', children: 'text 1' },
    { type: 'li', children: 'text 2' },
    { type: 'li', children: 'text 3' }
  ]
}

renderer.render(vnode, document.querySelector('#app'))
renderer.render(newVNode1, document.querySelector('#app'))
renderer.render(newVNode, document.querySelector('#app'))
