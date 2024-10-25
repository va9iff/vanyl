import { fn, div, on, onn, custom, set, put, cls, ottr, attr, orderless, update, state, v, style, app } from "./velo.js"

//               test
// -----------------------------------------

const profile = fn((props, local) => {
	props.count ??= 0
	local.count ??= props.count
	return div`
	<button ${{ on, click: e => local.count++ }} >
		u${props.count} ${local.count} just wait a little after click
	</button>
	`})



const randb = () => Math.random() > 0.5
const arca = () =>  
	// randb() ? "uffishuuuuuuuu" :
		randb() 
		? [
			div`la 1--------kj`,
			div`la 2-------- susoaf${Math.random()+'k'} moder flipcker`,
			div`la 3--------p`,
			div`la 4-------- jajalo${281}`,
			div`la 5-------- kaka${22}`
		] : randb() 
		? [
			div`la 1---------jui`,
			div`la 2---------juui`,
			div`la 3---------jitsu`
		] : randb() 
		? []
		: [
			div`la 1---------twooo`,
			div`la 2---------yaaa`
		]

window.ora = [
	{
		key: 1,
		count: 22
	}, {
		key: 2,
		count: 8,
	}, {
		key: 44,
		count: "jaja"
	}
]

state.gnum = 15

const iput = document.createElement("div")
const eput = document.createElement("div")
iput.innerHTML = "<input>I put it <b>here</b>"
eput.innerHTML = "<input>eeeeeeeeeeeeee"

const vavala = () => v`
	<span ${{ style, color: "red" }}>haha</span>
	<span>vaval</span>
	<span>vaval</span>
	<span>ja1</span>
`


const mydiver = () => {
	const even = !(state.gnum % 2)
	return div`
	${state.getClassFor}
	${state.mark}
	<button ${{ onn, click: e => state.gnum++ }}>g+</button>
	<button ${{ onn, click: e => state.gnum-- }}>g-</button>
	<div style="display: flex; overflow: scroll">
		<input> <input> <input> <input> <input> <input> <input> <input> <input> <input>
		<input ${{ custom, update: inp => even && inp.scrollIntoView() }} ${{set, value: 99}}>
		<input> <input> <input> <input>
	</div>
	<hr>
	<div ${{ if: state.gnum % 2 }}>is visible</div>
	${randb() ? vavala() : "here da mada"}

	${put(state.gnum > 19 ? iput : eput)}

	<h1 ${{ style, fontSize: state.gnum + "px"}} ${{ cls, border: ! (state.gnum % 2), color: ! (state.gnum % 3) }}>globus ${state.gnum}</h1>
	<details ${{ ottr, open: state.gnum >= 20 }}>
	lalala
		<summary>
			detaylar
		</summary>
	</details>
	<img ${{ attr, src: state.gnum >= 18 ? "./red.png" : state.gnum >= 10 ? "./blue.png" : none }} alt="imigi">
	${orderless(window.ora, profile)}
	<hr>
	<button 
		${{ set, disabled: randb() }}
		${{ on, click: e => alert('hi')}}
		${btn => console.log(btn)}
		>didi 
			${Math.random() + 'k'} limo
	</button>
	${randb() ? div`that's one` : div`and the other ${"hi"} ${Math.random()}`}
	${profile({count: 99})}
	${profile({count: 9})}
	<hr>
	${arca()}
	<hr>
	${randb() ? div`a vres` : "a string"}
	${{	log, stuff: "like that" }}
	<style>
	.border {
		border: 2px solid red
	}
	.color {
		color: red;
	}
	</style>
`
}
class log {
	static embedded = true
	static out = true
	init(arg, el) {
		console.log(el, arg.stuff)
	}
}

// const myVelo = new Velo(document.querySelector("#app"))
// myVelo.init(mydiver())
// const update = () => myVelo.update(mydiver())
// setInterval(update, 400)

// const myVelo = new Fn()
// myVelo.init(fn(mydiver)(), document.querySelector("#app"))
// setInterval(()=>myVelo.update(fn(mydiver)()), 400)

const myVelo = app("#app", mydiver)
setInterval(update, 800)
