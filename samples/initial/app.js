import {Vanyl, v, create, sync} from '/src/index.js'


let state = {
	value: "goes like ",
	disabled: false,
	data1: 212
}

// props isn't useful at the time. but we will implement a way to render from 
// vResult. so it will be usable like v`<a>${myView(props)}</a>`

let arr= [1,213,Math.random(),124,124]

let myView = props => v`
<div>
	<p>
	  that's an ${state.data1} test for ${5487} so yeah
	</p>
	and here's an input 
	<input type="text" 
	${{'disabled': state.disabled}}
	${{value: state.value}}>
	<button ${{onclick: ()=>alert()}}>alerts</button>endendend
	lets put a list
	<ul>
		WEIRD BUG - WE CAN'T USE DYNAMIC PROPERTIES ON FIRST ELEMENT BECAUSE OF .grabFirstChild()
		it will query the element and won't know that it has in it. so we need to add it too.
		${arr.map(prop=>v`<li><i ${{key: prop}}>${prop}</i></li>`)}
	</ul>
	this will be displayed, but,
</div>
<i>this won't</i>
and yes it works
`

let div = create(myView)
div.addTo(document.body)
document.body.appendChild(div.topElement)
div.update()

setInterval(()=>{
	state.value += (Math.random()+'')[3]
	state.disabled = !state.disabled
	state.data1++
	arr.shift()
	arr.push(Math.random())
	div.update()
}, 1200)

