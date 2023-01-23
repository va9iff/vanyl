import {Vanyl, vanyl, v, create, Lazy, unique} from '/src/index.js'

let text = new Lazy("text")
let b = true

let mainView = (props = "main") => v`
	<div>
		<input type="text" ${{"~value": text}}>
		${text.now}
		<button ${{onclick: e=>{
			main.update()
		}}}>a</button>

	</div>
`

let main = create(mainView)
document.body.appendChild(main.topElement)
main.update()	

console.log(text.now)