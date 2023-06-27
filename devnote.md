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


Router loading/importing and placeholder.
```js
... async wait => {
	wait(v`loading...`) || await import("./myPage.js")
	return v`<my-page></my-page>`
}
```
when this function is called first, the `wait` will return false, cousing the import statement to run.
> it's like waiting for return of the function. whatever passed will be shown while the script is loaded.

after awaiting for import to be done, and the function has run to the end, the 
return value will replace whatever `wait` has given to here. calling it second time
will couse `wait` to return true, short circuting and blocking the import.

but as it takes tame, if the second call was before the first function has ended, 
while importing the script, then the second call will be ignored. (or maybe take
the resullt and assign this instead of first's result.)


ROUTER
But I'm not sure and don't have much knowledge yet.
```js
// href with trailing slash "/" indicates custom routing
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
// completely different element. `<v-a></v-a>`. all the keys of this element 
// will treated as route of the value on the key.
v`
	<v-a ${{home: content}}>home</v-a>
	<a ${{profile: content}}>profile</a>
	<a ${{"etc/1": content}}>go to this</a>
`

// all a tags. key ending with "/" will be treated like a v-a tag key
v`
	<a ${{"home/": content}}>home</a>
	<a ${{"profile/": content}}>profile</a>
	<a ${{"settings/": content}}>settings</a>
	<a ${{"etc/1": content}}>go to this</a>
	<a ${{"hidden/": toolbar}}>close toolbar</a>
	<a ${{"tools/": toolbar}}>open toolbar</a>
`
```
! this way, we don't need to do anything to routes. we see we're updating 
content, so update every vanyl that it has in them. when content is inserted to 
a vanyl, add to its list. when the vanyl isn't connected anymore, remove it. 



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

maybe to add a setter for `.on` and having lists of vanyls where the router is 
used. so when `.on` is set on the router, it'll update the vanyls too but that's 
kinda unnecessary. how many places the same route would have been used?
```js
let pane1 = router({	
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
})
```


a quick way to define a component.
creates class, assigns given function to its `prototype.render`.
```js
tag["my-tag"] = function () {
	return v`something`
} // or
tag["my-tag"] = self => v`something`
```
or even in `asHTML/` folder with `.html` extension. it'll load the "text" and 
eval it and define a component. you can use ${this.prop} too in this html.
a little bit easier and cute way to work with more static components.literally evals this
```js
tag["file-name"] = function () {
	return v`file-content`
}
```