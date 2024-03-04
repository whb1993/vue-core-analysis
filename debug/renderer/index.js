// import { effect } from '../reactivity/effect/index.js'
// import { ref } from '../reactivity/ref/index.js'

function createRenderer(options) {
  // 通过 options 得到操作 DOM 的 API
  const { createElement, insert, setElementText } = options
  function mountElement(vnode, container) {
    // 调用 createElement 函数创建元素
    // const el = document.createElement(vnode.type)

    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      // 调用 setElementText 设置元素的文本节点
      // el.textContent = vnode.children
      setElementText(el, vnode.children)
    }
    // 调用 insert 函数将元素插入到容器内
    // container.appendChild(el)
    insert(el, container)
  }
  function patch(n1, n2, container) {
    // 如果 n1 不存在，意味着挂载，则调用 mountElement 函数完成挂载
    if (!n1) {
      mountElement(n2, container)
    } else {
      // n1 存在，意味着打补丁，暂时省略
    }
  }
  function render(vnode, container) {
    if (vnode) {
      // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数，进行打补丁
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 旧 vnode 存在，且新 vnode 不存在，说明是卸载（unmount）操作
        // 只需要将 container 内的 DOM 清空即可
        container.innerHTML = ''
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

// 在创建 renderer 时传入配置项
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
  }
})

const renderer2 = createRenderer({
  createElement(tag) {
    console.log(`创建元素 ${tag}`)
    return { tag }
  },
  setElementText(el, text) {
    console.log(`设置 ${JSON.stringify(el)} 的文本内容：${text}`)
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    console.log(`将 ${JSON.stringify(el)} 添加到 ${JSON.stringify(parent)} 下`)
    parent.children = el
  }
})
// 首次渲染
// renderer.render('oldVNode', document.querySelector('#app'))
// // 第二次渲染
// renderer.render('newVNode', document.querySelector('#app'))
// renderer.render(null, document.querySelector('#app'))
// })

const vnode = {
  type: 'h1',
  children: 'hello'
}

renderer.render(vnode, document.querySelector('#app'))

// 使用一个对象模拟挂载点
const container = { type: 'root' }
renderer2.render(vnode, container)
