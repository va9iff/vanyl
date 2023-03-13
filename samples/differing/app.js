import {Vanyl, v, create, Lazy, unique, ref} from '/src/index.js'
window.c = 0

let mainView = () => v`
	<div>
	<b>fasad ${c}</b>
	${c%2 ? [v`<li>aa</li>`,v`<button ${{disabled: true}}>bb</button>`]: [v`<li>a</li>`,v`<button>b${c**2}</button>`]}
	</div>
`

let main = create(mainView)
document.body.appendChild(main.root)
setInterval(() => {
	c++
	main.update()
},500)