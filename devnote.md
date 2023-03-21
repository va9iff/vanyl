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
