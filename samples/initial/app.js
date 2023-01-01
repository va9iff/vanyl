import {v, sync, text, attr, bool} from '/src/index.js'


let state = {
	value: "rf ref",
	disabled: false
}

let myView = ()=> v`
	that's an ${text(212)} test for ${text(5487)} so yeah
	and here's an input <input type="text" ${bool('disabled', state.disabled)} ${attr("value", state.value)}>
`

// let myViewV = ()=> v`that's an ${212} test for ${5487} so yeah`

let a = sync(myView, document.body)

a.update()

setInterval(()=>{
	state.value += "8888"
	state.disabled = !state.disabled
	a.update()
}, 2000)

console.log(a)


