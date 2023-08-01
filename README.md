
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# !!!!!!!! WE'RE REWIRTING !!!!!!
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

# Vanyl is being rewritten to be safer and more stable. please wait for the 
# main version to be published. You'll have all the functionality of the 
# previous one (on the below) and far more extensibility. stay tuned <3



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

### `snippets/` Dynamic Lists

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

### `snippets/` Components

```js
let user = prop => v`<div>
	<p>user's name: ${prop.name}</p>
	<p>this user's favorite color is ${prop.fav}</p>
</div>`

let main = () => v`<div>${user({name: "Violet", fav: "purpler"})}</div>`
```

---

### `snippets/` 2 Way Binding (lazy)

```js
let text = new Lazy("empty")

let main = () => v`<div>
	<input type="text" ${{value: text}}>

	<p>the value of input right now is ${text.now}</p>

	<button ${{"@click": e => text.now += "!"}}>add exclamation</button>
</div>`
```
`text.now` will always return the value of the input, and setting `text.now = "string"` 
will also sets the value of the input and doesn't require updates.
Initial value will be set to the argument of `Lazy`.

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

### `snippets/` Dynamic Stable Lists

```js
let data = [
	{ id: 1, cost: 12, item: "banana" },
	{ id: 2, cost: 80, item: "mango" },
	{ id: 3, cost: 99, item: "avocado" },
]
let main = () =>
	v`<ul>${data.map(
		prop => v`
		<li ${{ key: prop.id }}>
			${prop.item} - ${prop.cost} <br>
			your note - <input type="text">
		</li>`
	)}>/ul>`
```

By using `key`, you can "bring the old element" in updates so, Avocado's input
will always be the same and hold your note. You don't have to make its logic.
As Vanilla as possible!

---

### `snippets/` Reference

```js
let btn1
let main = () => v`
	<div>

		<button ${{
			do: it => btn1 = it,
			"@click": e => {
				alert('btn 1')
			}
		}}>I'm 1</button>

		<button ${{
			"@click": e => {
				alert('btn 2')
				btn1().click()
			}
		}}>I'm 2</button>

	</div>`
```

Note that we call `btn1`. If the Vanyl that the reference was used in is 
initialized, then it'll return to the element. Else, returns `null`.