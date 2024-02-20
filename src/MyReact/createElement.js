export default function createElement(type, props, ...children) {
  // createElement 返回的是一个对象

  return {
    props: {
      ...props,
      // 这是我第一次写的，没有使用map，只考虑了一种children的情况
      // children:
      //   typeof children === "object" ? children : createTextElement(children),
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child),
      ),
    },
    type,
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };

  // 这是我第一次手写，type是有的，没有考虑到 props
  // return {
  //   children: text,
  //   type: "TEXT_ELEMENT",
  // };
}
