
`updateProps` 
=============
should be method cuz we want to give them oppurtunity to change diffing. 
```js
	// ...
	updateProps(target, props, oldProps){
		if (props["some special prop"]) doSpecialThing()
		delete props["some special prop"] // so won't be updated the default way
		super.updateProps(target, props, oldProps) // all the others default way
	}

```

`typeof arg == VResult`
=======================
we use `markHTML()` but won't this cause multiple `V1`?
yes but those will be removed at `.process()`
it'll start again for this `VanylController` with the same element.