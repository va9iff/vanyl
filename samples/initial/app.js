import {v, sync, text, attr, bool, prop, on} from '/src/index.js'


let state = {
	value: "rf ref",
	disabled: false,
	data1: 212
}

let myView = ()=> v`
	that's an ${text(state.data1)} test for ${text(5487)} so yeah
	and here's an input <input type="text" ${bool('disabled', state.disabled)} ${prop("value", state.value)}>
	<button ${on('click', ()=>alert())}>alerts</button>
`

// let myViewV = ()=> v`that's an ${212} test for ${5487} so yeah`

let a = sync(myView, document.body)

a.update()

setInterval(()=>{
	state.value += "8888"
	state.disabled = !state.disabled
	state.data1++
	a.update()
}, 2000)

console.log(a)


