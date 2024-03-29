import {Vanyl, v, create, unique} from '/src/index.js'
import { Lazy } from '/src/directives/Lazy.js'

let text = new Lazy("text")
let c = 0

let mainView = (props = "main") => v`
	<div>
		<input type="text" ${{value: text}}>
		${c++} ${text.now}
		<button ${{onclick: e=>{
			text.now += "CLICK!"
			// main.update()
		}}}>a</button>
		<button ${{onclick: e=>{
			main.update()
		}}}>update now</button>

	</div>
`

let main = create(mainView)
document.body.appendChild(main.root)
main.update()	

setInterval(()=>main.update(), 2000)