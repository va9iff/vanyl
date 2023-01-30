# The Most Vanilla Declarative UI Library


Aside from built in 2 way data binding `lazy`, Vanyl doesn't have any knowledge about your data so, when it's changed, you should call update.

---

Full snippet at `snippets/Snippet Name.js`

---

### `snippets/` Dynamic Text

```js
let name = "World"
let main = () => v`<div>Hello ${name}</div>`
```

---

### `snippets/` Dynamic Property

```js
let isDisabled = false
let main = () => v`<button ${{ disabled: isDisabled }}>Can you click?</button>`
```

---

### `snippets/` Add Event Listener

```js
let main = () =>
	v`<button ${{
		"@click": e => (isDisabled = !isDisabled),
	}}>Maybe try again</button>`
```

---

### `snippets/` Dynamic lists

```js
let data = [
	{ cost: 12, item: "banana" },
	{ cost: 80, item: "mango" },
	{ cost: 99, item: "avocado" },
]
let main = () =>
	v`<ul>${data.map(prop => v`<li>${prop.item} - ${prop.cost}</li>`)}>/ul>`
```

---

### `snippets/` Composition

```js
let tabs = {
	get home: () => v`<div>this is home</div>`,
	get edit: () => v`<div>edit profile</div>`,
}

let active = "home"

let main = () => v`<div>${tabs[active] ?? "no such tab"}</div>`
```

---

### `snippets/` Dynamic stable lists

```js
let data = [
	{ id: 1, cost: 12, item: "banana" },
	{ id: 2, cost: 80, item: "mango" },
	{ id: 3, cost: 99, item: "avocado" },
]
let main = () =>
	v`<ul>${data.map(
		prop => v`<li ${{ key: prop.id }}>
		${prop.item} - ${prop.cost} <br>
		your note - <input type="text">
	</li>`
	)}>/ul>`
```

By using `key`, you can "bring the old element" in updates so, Avocado's input
will always be the same and hold your note. You don't have to make its logic.
As Vanilla as possible!
