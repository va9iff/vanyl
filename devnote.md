```js
let val

v`

<div> must have the top level wrapper object
	<input ${{
		value: 27, // initial set
		$value: val, // set every update
		"@change": e => {
			val = e.target.value
			this.update() // this is the element. its update is actually vanyl's update wrapper.
		},
		at: {
			change: e => {}, // looks exactly same with @change
		}, // those are actually project the's features with some additions.
	}}></input>
	${val} dynamic text. this is literally a text ndoe.
	also can be array of v'', or one v''. (! pure elements isn't supported !)
	the text node will be used as anchor to place those in place too.
</div>
`
```

will rise error. currently only accept vResult

```js
;["text", v`<b>some</b>`] // v`text` will won't work too
// as this can't be a root element.
```




AN OPTIONAL WAY TO UPDATE CHILD COMPONENTS ON PARENT UPDATE
we can use like `${{depends: this}}` and add it into `this` so `this` updates
it'll update too but it's tidious and having to refer parent isn't ideal here.
we can still have this option too. but automatic way would be like this:
`reactive` is a simple mark. the element will be queried on parent's update
as there's a `the` object. but it only has `reactive` so it's cleaner and
easier to read what it does. under the hood, it's just a specific key for 
`the`. also a specific value but that doesn't matter. `reactive` key shouldn't 
be used with different values. they may use `{depends: []}`.
```js
import {reactive} from "/vanyl.js"

tag["my-tag"] = () => v`
	<other-tag ${{reactive}}></other-tag>
	<p>auto update the element above</p>
	`
```

ROUTER
But I'm not sure and don't have much knowledge yet.
```js
tag["my-tag"] = () => v`
	<a ${{"href/": "home"}}>home</a>
	<a ${{"href/": "etc"}}>etc</a>
	<a ${{"href/": "etc/1"}}>get 1</a>

	<my-tag ${{"/": "home"}}></my-tag>
	<my-other ${{"/": "etc"}}></my-other>
	<my-other-two ${{"/": "etc/:id"}}></my-other-two>
	`
```
an alternative 
```js
let content = {
	switch,
	on: "pane1",
	pane1: props => v`<span>that's tab 1</span>`,
	pane2: props => v`<i>that's tab2 with some list</i>
		${window.someList.map(item=>v`
			<p>${item.caption}</p>
		`)}
	`
}

v`
	<button ${{"@click": e=>content.selected = "pane1"}}>pane1</button>
	<button ${{"@click": e=>content.selected = "pane2"}}>pane1</button>
	<button ${{"@click": e=>content.pane1.selected = "inner1"}}>pane1</button>
	<button ${{"@click": e=>content.pane1.selected = "inner1"}}>pane1</button>
	${content}
`
```
theJS switch key will check if the value is switch constant. if so,
it'll take the object, get the value on its key that its named is in its "selected" key.
run it, this should be a function and give a vResult.

then treat it just like a vResult. or maybe re-run the init process for it.
allows it to be list, vResult, text. and even another switch.
(it won't call selected property every time. check if it's switch, treat it 
like one again. if it's a function, call it and then treat it right)
```js
// name switch was replaced with tab as it is a keyword
// or maybe I should change tab with go. it has nice
//    go,
//    on: "pane1",
// this go on thing

import { go, v } from "/vanyl.js"
let content = {
	go,
	on: "pane1",
	pane1: ({
		go,
		on: "inner2",
		inner1: props => html`that's 1`,
		inner2: props => html`here's another
			some template
			in nested switcher
		`,
		default: () => "select inner tab", // isn't "on" already a default
		}),
	pane2: props => html`<i>that's tab2 with some list</i>
		${window.someList.map(item=>html`
			<p>${item.caption}</p>
		`)}
	`,
	pane3: () => html`<p>a basic tab</p>`
}

v`
	<button ${{"@click": e=>content.go.pane1()}}>pane1</button>
	<button ${{"@click": e=>content.go.pane2()}}>pane1</button>
	<button ${{"@click": e=>content.go.pane1().inner1()}}>pane1</button>
	<button ${{"@click": e=>content.go.pane1().go.inner1({ id: 89 })}}>pane1</button>
	<button ${{"@click": e=>content.go.pane1().inner1({ id: 89 })}}>pane1</button>
	${content}

	${content.go.pane1()} goes to pane 1
	${content.pane1()} returns pane1 vResult

	nested
	${content.go.pane1().go.inner1()} goes to pane1 to inner1 in it
	${content.pane1.inner1()} from pane1 object calls inner1 which returns inner1 vResult
	arguments are props given to the function in both case.

	the most beautiful 

```



```js
// or pure vanilla. vanyl can figure that out.
import { v } from "/vanyl.js"
let content = {
	on: "pane1",
	pane1: () => ({
		on: "inner2",
		inner1: () => html`that's 1`,
		inner2: () => html`here's another
			some template
			in nested switcher
		`,
		default: () => "select inner tab",
		}),
	pane2: () => html`<i>that's tab2 with some list</i>
		${window.someList.map(item=>html`
			<p>${item.caption}</p>
		`)}
	`,
	pane3: () => html`<p>a basic tab</p>`
}

v`
	<button ${{"@click": e=>content.on = "pane1"}}>pane1</button>
	<button ${{"@click": e=>content.on = "pane2"}}>pane1</button>
	<button ${{"@click": e=>{
		content.on = "pane1"
		content.pane1.on = "inner1"
		// a shortcut
		content.on = "pane1/inner1"
		// but yes, we won't have any props here.
	}}}>pane1</button>
	<button ${{"@click": e=>content.on = "pane1/inner1"}}>pane1</button>
	${content}

```
if an arg
	is outside of tag
	is object
	has "selected" key
	the value of key that its name is the value of "selected" key is function
	the return value of the function is a vResult

then it's tabber object.


```js
// or maybe like
`${{
	on: "pane1",
	props: {id: 87},
	pane1: () => v`
		${this.id}
	`
}}`

`${content.props = {id:88}}
${content.on = "pane1"}`


// or a "go" constant for ease of use
content.go("pane1", {id: 88})
content.go.pane1({id: 88}).

```