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