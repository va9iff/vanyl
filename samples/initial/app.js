import {v, sync, text, attr} from '/src/index.js'


let state = {
	value: "rf ref"
}

let myView = ()=> v`
	that's an ${text(212)} test for ${text(5487)} so yeah
	and here's an input <input type="text" ${attr("value", state.value)}>
`

// let myViewV = ()=> v`that's an ${212} test for ${5487} so yeah`

let a = sync(myView, document.body)

a.update()

setInterval(()=>{
	state.value += "8888"
	a.update()
}, 2000)

console.log(a)


