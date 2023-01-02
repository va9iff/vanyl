import {v, sync, text, attr, bool, prop, on} from '/src/index.js'


let state = {
	value: "rf ref",
	disabled: false,
	data1: 212
}




let myView = ()=> v`
	that's an ${text(state.data1)} test for ${text(5487)} so yeah
	and here's an input 
	<input type="text" 
	${bool('disabled', state.disabled)} 
	${prop("value", state.value)}>
	<button ${on('click', ()=>alert())}>alerts</button>
`

/*let myView1 = ()=> v`
	that's an T${state.data1} test for T${5487} so yeah
	and here's an input 
	<input type="text" 
	?disabled${state.disabled} 
	.value${state.value} 
	-attribute${state.value}>
	<button @click${()=>alert()}>alerts</button>

	?disabled = ${state.disabled} 
	.value = ${state.value} 
	-attribute = ${state.value}>
	<button @click = ${()=>alert()}>alerts</button>
`*/


let myView2 = ()=> v`
	that's an ${text(state.data1)} test for ${text(5487)} so yeah
	and here's an input 
	<input type="text" 
	${{'?disabled': state.disabled}} 
	${{'attributes': state.value}}
	${{value: state.value}}>
	<button ${{'@click': ()=>alert()}}>alerts</button>
`




// attr.value(state.disabled)
// bool.disabled(state.disabled)
// on.click(()=>alert())

let a = sync(myView, document.body)

a.update()

setInterval(()=>{
	state.value += "8888"
	state.disabled = !state.disabled
	state.data1++
	a.update()
}, 2000)

console.log(a)


