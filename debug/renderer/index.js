// import { effect } from '../reactivity/effect/index.js'
// import { ref } from '../reactivity/ref/index.js'

function unmount(vnode) {
  const parent = vnode.el?.parentNode
  if (parent) {
    parent.removeChild(vnode.el)
  }
}
function createRenderer(options) {
  // 通过 options 得到操作 DOM 的 API
  const { createElement, insert, setElementText, patchProps } = options

  function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      // 如果 children 是数组，则遍历每一个子节点，并调用 patch 函数挂载它们
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        // 调用 patchProps 函数即可
        patchProps(el, key, null, vnode.props[key])
      }
    }

    insert(el, container)
  }
  function patchElement(n1, n2) {}

  function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    // 代码运行到这里，证明 n1 和 n2 所描述的内容相同
    const { type } = n2
    // 如果 n2.type 的值是字符串类型，则它描述的是普通标签元素
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container)
      } else {
        patchElement(n1, n2)
      }
    } else if (typeof type === 'object') {
      // 如果 n2.type 的值的类型是对象，则它描述的是组件
    } else if (type === 'xxx') {
      // 处理其他类型的 vnode
    }
  }
  function render(vnode, container) {
    if (vnode) {
      // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数，进行打补丁
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 根据 vnode 获取要卸载的真实 DOM 元素
        unmount(container._vnode)
      }
    }

    // 把 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
    container._vnode = vnode
  }

  function hydrate(vnode, container) {
    // ...
  }

  return {
    render,
    hydrate
  }
}
// effect(() => {
// const renderer = createRenderer()

function shouldSetAsProps(el, key, value) {
  // 特殊处理
  if (key === 'form' && el.tagName === 'INPUT') return false
  // 兜底
  return key in el
}
const renderer = createRenderer({
  // 用于创建元素
  createElement(tag) {
    return document.createElement(tag)
  },
  // 用于设置元素的文本节点
  setElementText(el, text) {
    el.textContent = text
  },
  // 用于在给定的 parent 下添加指定元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  patchProps(el, key, prevValue, nextValue) {
    // 对 class 进行特殊处理
    if (key === 'class') {
      el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  }
})

// 首次渲染
// renderer.render('oldVNode', document.querySelector('#app'))
// // 第二次渲染
// renderer.render('newVNode', document.querySelector('#app'))
// renderer.render(null, document.querySelector('#app'))
// })

const vnode = {
  type: 'div',
  // 使用 props 描述一个元素的属性
  props: {
    id: 'foo'
  },
  children: [
    {
      type: 'p',
      children: 'hello'
    }
  ]
}
const newVNode = {
  type: 'div',
  // 使用 props 描述一个元素的属性
  props: {
    id: 'foo1'
  },
  children: [
    {
      type: 'p',
      children: 'hello'
    }
  ]
}

renderer.render(vnode, document.querySelector('#app'))

// 再次挂载新 vnode，将触发更新
renderer.render(newVNode, document.querySelector('#app'))
renderer.render(null, document.querySelector('#app'))
