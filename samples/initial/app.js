import {v, sync, render} from '/src/index.js'


let state = {
	value: "rf ref",
	disabled: false,
	data1: 212
}



let myView = ()=> v`
<div>
	<p>
	  that's an ${state.data1} test for ${5487} so yeah
	</p>
	and here's an input 
	<input type="text" 
	${{'disabled': state.disabled}}
	${{value: state.value}}>
	<button ${{'@click': ()=>alert()}}>alerts</button>endendend
</div>
`

// attr.value(state.disabled)
// bool.disabled(state.disabled)
// on.click(()=>alert())

let a = sync(myView, document.body)

// let b = render(myView)

a.update()

setInterval(()=>{
	state.value += "8888"
	state.disabled = !state.disabled
	state.data1++
	a.update()
}, 1200)

console.log(a)


