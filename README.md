# Reactivity.js

![GitHub branch checks state](https://img.shields.io/github/checks-status/hlehmann/reactivityjs/master)
![Codecov](https://img.shields.io/codecov/c/github/hlehmann/reactivityjs)
![GitHub](https://img.shields.io/github/license/hlehmann/reactivityjs)

## Concepts

- Source: a "watchable" version of an object
- Watcher: a readonly object that detect read data and subscribe for any change

## Basic example

```jsx
// define sources

const userSource = getSource({
  name: "John",
  parent: { name: "Henry" },
});

// watch sources

runner((watch) => {
  const user = watch(userSource);
  document.getElementById("user-name").textContent = user.name;
});

const Component = () => {
  const user = useWatch(userSource);
  return <div>{user.parent.name}</div>;
};

// update sources

userSource.parent.name = "Tim";
user.$source.parent.name = "Tim";
```

## How it works

- It uses Proxy to detect read fields and updated fields.
- It uses WeakMap and WeakRef to make efficient subscriptions.
