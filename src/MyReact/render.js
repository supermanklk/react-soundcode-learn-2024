let nextUnitOfWork = null;

// 10-0 Reconciliation 协调阶段，这个阶段就是我们大名鼎鼎 diff 算法的阶段
// 既然是 diff 算法，那么它的核心思想就是比较,然后找到其中的不同，求同存异
// 那么我们要比较什么呢？
// 虚拟DOM  -> fiber树 -> 真实DOM 所以我们生成fiber数是根据我们fiber数来的
// 所以更新我们所比较的是 fiber 树

// @9-5
let workInProgressRoot = null;

// 10-1  上一次的 fiber 数, 我们在什么阶段可以得到 currentRoot？ 那就是 commitRoot 提交阶段
let currentRoot = null;

// 10-6
let deletions = [];

// @8
// function createDOM(element) {
//   const dom =
//     element.type === 'TEXT_ELEMENT'
//       ? document.createTextNode('')
//       : document.createElement(element.type);

//   const isProperty = (key) => {
//     return key !== 'children';
//   };

//   Object.keys(element.props)
//     .filter(isProperty)
//     .forEach((item) => {
//       if (dom[item] !== undefined) {
//         dom[item] = element.props[item];
//       } else {
//         dom.setAttribute(item, element.props[item]);
//       }
//     });

//   return dom;
// }

// 10-12 给之前的 createDOM 注释了
function createDOM(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

// 10-5
function reconcilerChildren(wipFiber, elements) {
  let prevSibling = null;
  let index = 0;
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child;
  while (index < elements.length || !!oldFiber) {
    const childrenElement = elements[index];
    // newFiber 我们就不要了, 接下来我们看看 reconcilerChildren 需要接收那些参数, 其实我们要做的事情就是 老的 fiber  和 新的giber 做一个对比
    //
    // const newFiber = {
    //   type: element.type,
    //   props: element.props,
    //   parent: fiber,
    //   dom: null,
    // };

    let newFiber = null;
    const sameType =
      oldFiber &&
      childrenElement &&
      childrenElement.type === oldFiber.type;
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: childrenElement.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (!sameType && childrenElement) {
      newFiber = {
        type: childrenElement.type,
        props: childrenElement.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (!sameType && oldFiber) {
      oldFiber.effectTag = 'DETETION';
      deletions.push(oldFiber);
    }

    // 10-9 这样的话才是同级之前的比较
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

// perfor = 执行
// @3
function performUnitOfWork(fiber) {
  // 执行任务单元 = 一个虚拟dom转换为一个真实DOM
  // 为当前的 fiber 创建它子节点的 fiber
  // 返回下一个任务单元

  if (!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }
  if (fiber.parent) {
    // 当时我有疑问 创建了当前fiber节点的dom，为什么要假如到父节点的DOM中？
    // 其实我们这里看到的是 appendChild，拿到父dom， dom.appendChild 就是添加子dom
    //  appendChild
    // @9-3 因为我们这个操作不就不在这里做了,因为我们现在要一次性提交,那我们肯定要满足某个条件的时候再一次性提交
    // fiber.parent.dom.appendChild(fiber.dom);
  }

  // 获取当前 fiber 的子节点
  const elements = fiber.props.children;
  reconcilerChildren(fiber, elements);
  let index = 0;

  // 10-4 注释
  // let prevSibling = null;
  // while (index < elements.length) {
  //   const element = elements[index];
  //   const newFiber = {
  //     type: element.type,
  //     props: element.props,
  //     parent: fiber,
  //     dom: null,
  //   };
  //   if (index === 0) {
  //     fiber.child = newFiber;
  //   } else {
  //     prevSibling.sibling = newFiber;
  //   }
  //   prevSibling = newFiber;
  //   index++;
  // }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

// @4
// 接下来我们了解下React的filber
// fiber
// fiber 是一个数据结构
// 它是干什么的？ 它是用来组织我们数据单元的,每一个fiber都是一个任务单元
// 通过 createElement 得到 ReactElement ---经过调料 fiber 加工 --> view

// @5
// 以下是一个html片段
/**
 * <div>
 *    <h1>
 *        <p></p>
 *        <a></a>
 *    </h1>
 *    <h2>
 *    </h2>
 * </div>
 */
// react 会首先创建一个根的节点 root ,把它设置为一个工作单元
// root
//  |
// div
//  |
//  h1 --- h2
//  |
//  p --- a

//  fiber dfs 图 https://supermanbin.oss-cn-beijing.aliyuncs.com/fiber-find.png
// 从root开始，找到div，找到h1、找到p，发现p没有子节点，找p的兄弟节点a，a没有兄弟和子节点，就会找父节点的兄弟节点h2
// h2没有兄弟和子节点，就去找div，div没有兄弟节点，就找到root，完成,代表fiber树就渲染完成了

// 筛选出事件
const isEvent = (key) => key.startsWith('on');
// 筛选出 children 属性
const isProperty = (key) => key !== 'children';
// 筛选出要移除的属性
const isGone = (prev, next) => (key) => !(key in next);
// 挑选出新的属性
const isNew = (prev, next) => (key) =>
  prev[key] !== next[key];

function updateDom(dom, prevProps, nextProps) {
  // 移除掉旧的监听事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      (key) =>
        isGone(prevProps, nextProps)(key) ||
        isNew(prevProps, nextProps)(key),
    )
    .forEach((name) => {
      const eventType = name
        .toLocaleLowerCase()
        .substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 移除掉不存在新props里的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => (dom[name] = ''));

  // 新增
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => (dom[name] = nextProps[name]));

  // 新增事件

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name
        .toLocaleLowerCase()
        .substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitWork(fiber) {
  if (!fiber) return;
  const domParent = fiber.parent.dom;
  // 10-10 注释
  // domParent.appendChild(fiber.dom);
  switch (fiber.effectTag) {
    case 'PLACEMENT':
      // 当dom节点存在
      !!fiber.dom && domParent.appendChild(fiber.dom);
      break;
    case 'UPDATE':
      // 10-11
      !!fiber.dom &&
        updateDom(fiber.dom, fiber.alternate, fiber.props);
      break;
    case 'DELETION':
      !!fiber.dom && domParent.removeChild(fiber.dom);

      break;

    default:
      break;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// @9-5
function commitRoot() {
  // 做渲染，真实DOM的操作
  commitWork(workInProgressRoot.child);
  // 10-8
  deletions.forEach(commitWork);

  // 10-2
  currentRoot = workInProgressRoot;

  workInProgressRoot = null;
}

// @1
function workloop(deadline) {
  // requestIdleCallback 接收一个函数作为回调函数
  // 它会在浏览器空闲的时候调用这个函数,你传入的回调函数会得到一个 deadline 参数
  // deadline 参数上面有一个 deadline.timeRemaining() 通过这个方法可以获取当前帧剩余的时间
  // 通过当前帧剩余的时间来判断我们是否要继续执行我们的工作流
  // 当然 React 没有使用浏览器的Api requestIdleCallback， React自己撸了一个方法
  // React撸的方法叫做【调度】，schedule，schedule与requestIdleCallback他们的概念是相同的

  // 工作流 浏览器是否有空间时间 --yes-> 是否存在下一个任务单元 --yes-> 执行工作单元 --done-> 浏览器是否有空余时间 --> 循环

  let shouldYield = true; // 是否存在空余的时间

  // @9-0 如果dom树特别大，浏览器会中断这个过程，比如我们有的子dom没有添加进去,就会出现一个不完整的UI
  while (nextUnitOfWork && shouldYield) {
    // @2
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 会执行传入的任务单元，返回下一个任务单元

    shouldYield = deadline.timeRemaining() > 1; // 得到浏览器当前剩余的时间

    // @9-1 比如我们在这里打一个debugger模拟一下
    // debugger;
    // @9-2 然后会发现我们的UI是被debugger打断的,优化：当我完成所有 fiber 树遍历的时候，我再去一次性的提交它

    // @9-4 没有下一个工作单元的时候，说明 fiber 遍历了一遍
    // 成立条件是没有下一个工作单元 并且有 fiber 树
    if (!nextUnitOfWork && workInProgressRoot) {
      // 我们的渲染是根据我们的f iber 进行渲染的

      // 这里我们实现了 commit 阶段， 我们所在的 while 循环就是 render 阶段
      commitRoot();
    }
  }

  requestIdleCallback(workloop); // 可以把它看成是一个setTimeout
}

requestIdleCallback(workloop);

// @7
export default function render(element, container) {
  console.log('faith=============element', element);
  // 此刻我们 render 就不负责创建真实 DOM 了
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
    // 10-3 最终 workInProgressRoot 会作为一个任务单元传入到 performUnitOfWork 中，那么在 performUnitOfWork中就可以通过 alternate 属性
    // 得到我们上一次提交的 fiber 树
    alternate: currentRoot,
  };

  nextUnitOfWork = workInProgressRoot;

  // 10-7
  deletions = [];
}

// @6 注释下面
// export default function render(element, container) {
//   // element是一个对象，有type和props
//   const dom =
//     element.type === 'TEXT_ELEMENT'
//       ? document.createTextNode('')
//       : document.createElement(element.type);

//   const isProperty = (key) => key !== 'children';

//   Object.keys(element.props)
//     .filter(isProperty)
//     .forEach((item) => {
//       if (dom[item] !== undefined) {
//         dom[item] = element.props[item];
//       } else {
//         dom.setAttribute(item, element.props[item]);
//       }
//     });

//   // 通过递归方式我们进行render
//   // 递归一旦执行就不会停止,直到我们渲染成一个完成的dom树 如果我们初始element非常大，那么我们
//   // 会花费更多的时间进行渲染,它就会有可能堵塞我们的浏览器线程
//   //
//   element.props.children.forEach((child) =>
//     render(child, dom),
//   );

//   container.appendChild(dom);
// }
