import { v } from "/src/index.js"
import { tag } from "/src/functionalElement.js"

/* 
	defineFunctional('my-fungi', ()=>v`<b ${{"@click": e => console.log(e.target.innerHTML=Math.random())}}>fungiiiiiiii</b>`)
	let f = document.createElement('my-fungi')
	document.body.appendChild(f)*/

tag["my-fungi"] = () => v`
	asfjlk${"fasad"}<b>my fungi ${Math.random()}</b>
	`

let f = document.createElement("my-fungi")
document.body.appendChild(f)
