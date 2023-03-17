dynamic text				+
dynamic attributes			-
dynamic properties			+
adding event listeners		+
dynamic list views			++
? conditional views			+
nested rendering			+
?!- routing					-

2 way binding +



```js
let userView = props => v`username: ${props.text}`

let mainView = props => v`
	<div ${{
		property: value,
		'.cssClass': bool,
		'@event': function,
	}}>
		${['foo','bar','baz'].map(user=>userView(user))}
	</div>`

let mainVanyl = create(main).to(document.body)
```

## to refer the element itself
```js
// instead of this
v`<div ${{do: it => markUp(it)}}></div>`

// do this
v`<div ${it => markUp(it)}></div>`

// does it realy worth? it's not even an effort but seems useless and confusing
```