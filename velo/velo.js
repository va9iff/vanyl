export class Velo  {
	static out = true
	static embedded = true
	#render({ strings, args, tag }) {
		const [html, ionClasses] = mark(strings, ...args)
		this.element = document.createElement(tag)
		this.element.innerHTML = html
		this.pins = []
		this.ions = []
		for (const [i, IonClass] of ionClasses.entries()) {
			let pin = this.element.querySelector(`[v${i}]`)
			if (IonClass.out) {
				const textNode = document.createTextNode("")
				pin.replaceWith(textNode)
				pin = textNode
			}
			console.assert(pin, `broken html: couldn't query v${i} \n`, html)
			const ion = new IonClass()
			ion.init?.(args[i], pin)
			this.ions.push(ion)
			this.pins.push(pin)
		}
	}
	update(vres) {
		if (!this.isSame(vres)) {
			this.element.remove()
			this.#render(vres)
			this.el.after(this.element)
		} else for (const [i, pin] of this.pins.entries()) {
			const arg = vres.args[i]
			const ionClass = getClassFor(arg)
			if (this.ions[i].constructor == ionClass) {
				this.ions[i].update?.(arg)
			} else {
				this.ions[i].die?.()
				this.ions[i] = new ionClass()
				this.ions[i].init?.(arg, pin)
			}
		}
		this.last = vres
	}
	init(arg, el) {
		this.el = el
		this.#render(arg)
		this.el.after(this.element)
		this.last = arg
	}
	die() {
		this.element.remove()
	}
	isSame(vres) {
		if (this.last.strings.length != vres.strings.length) return false
		// if (this.last.args.length != vres.args.length) return false
		for(let i = 0; i < this.last.strings.length; i++) {
			if (this.last.strings[i] != vres.strings[i]) return false
		}
		return true
	}
}

class ArrayIon  {
	static out = true
	ions = []
	pins = []
	init(arg, el) {
		this.el = el
		this.update(arg)
	}
	update(array) {
		while (this.pins.length < array.length) {
			const pin = document.createTextNode("")
			this.el.before(pin)
			this.pins.push(pin)
		}
		for (let i = 0; i < Math.max(this.ions.length, array.length); i++) {
			const arg = array[i]
			if (!array[i]) {
				this.ions[i]?.die()
				this.ions[i] = null
				continue
			}
			const ionClass = getClassFor(arg)
			if (!this.ions[i]) {
				this.ions[i] = new ionClass()
				this.ions[i].init(arg, this.pins[i])
				continue
			}
			if (this.ions[i].constructor != ionClass) {
				this.ions[i].die()
				this.ions[i] = new ionClass()
				this.ions[i].init(arg, this.pins[i])
			} else {
				this.ions[i].update(arg)
			}
		}
		while (this.ions.length && !this.ions.at(-1)) this.ions.pop()
		this.el.nodeValue = this.ions.length
	}
	die() {
		for (const ion of this.ions) ion?.die()
		for (const pin of this.pins) pin.remove()
		this.ions = []
		this.pins = []
	}
}



// not testeddddd
class OrderlessArrayIon {
	static out = true
	live = {}
	init(arg, el) {
		this.el = el
		this.update(arg)
	}
	update({ array, fun, key }) {
		key ||= key
		for (const [i, obj] of array.entries()) {
			const arg = fun(obj)
			if (array[i]) {
				const ionClass = getClassFor(arg)
				if (this.live[obj[key]]) {
					if (this.live[obj[key]].constructor != ionClass) {
						this.live[obj[key]].die()
						this.live[obj[key]] = new ionClass()
						this.live[obj[key]].init(arg, this.el)
					} else {
						this.live[obj[key]].update(arg)
					}
				} else {
					this.live[obj[key]] = new (getClassFor(arg))
					this.live[obj[key]].init(arg, this.el)
					// console.log(arg)
				}
			}
			if (!array[i]) {
				this.live[arg.key]?.die()
			}
		}
		this.el.nodeValue = this.live.length
	}
	die() {
		for (const ion of Object.values(this.live)) ion?.die()
	}
}
const orderless = (array, fun, key = "key") => {
	return { array, fun, key } 
}



export function mark(strings, ...args) {
	let htmlString = ""
	const ionClasses = []
	for (const [i, arg] of args.entries()) {
		const ionClass = getClassFor(arg)
		ionClasses.push(ionClass)
		htmlString += strings[i] + (ionClass.out ? `<wbr v${i}>` : `v${i}`)
	}
	htmlString += strings[strings.length - 1]
	return [htmlString, ionClasses]
}


function getClassFor(arg) {
	switch(typeof arg) {
		case "number":
		case "string":
		case "undefined":
			return TextIon
		case "function": 
			return FunctionIon
		case "object":
			for (const key in arg) {
				const val = arg[key]
				if (typeof val == "function" && val.embedded) return val
			}
	}
	if (Array.isArray(arg)) return ArrayIon
	if (Array.isArray(arg.array)) return OrderlessArrayIon
	console.log(arg)
	throw new Error("coulndn't find a ion for that argument ")
}

// simpler ions

const fn = fun => props => ({ fun, Fn, props })
// fn(fun)(props) -> fun(props) // re-entering the props that were given in init
class Fn extends Velo {
	static embedded = true
	local = {}
	init(arg, el) {
		this.local = {}
		this.html = arg.fun
		super.init(this.html(arg.props, this.local), el)
	}
	update(arg) {
		if (arg?.fun) this.html = arg.fun
		super.update(this.html(arg.props, this.local))
	}
}

const apps = []
const state = {} // global state
function app(selector, fun) {
	if (typeof selector == "string") selector = document.querySelector(selector)
	const ion = new Fn()
	apps.push(ion)
	ion.init({ fun, props: state }, selector)
}
// update all Fn components that are defined with app()
function update() {
	for (const app of apps) app.update({ props: state})
	return true
}

class TextIon {
	static out = true
	init(arg, el) {
		this.element = document.createTextNode(arg)
		el.after(this.element)
	}
	update(arg) {
		this.element.nodeValue = arg
	}
	die() {
		this.element.remove()
	}
}

class FunctionIon  {
	init(arg, el) {
		arg(el)
	}
}

class on {
	static embedded = true
	init(arg, el) {
		for (const key in arg)
			if (arg[key] !== on)
				el.addEventListener(key, arg[key])
	}
}

let uptodate = false
const schedule = () => {
	uptodate = false
	setTimeout(()=>{
		if (uptodate) return
		update()
		uptodate = true
	})
}

class onn {
	static embedded = true
	init(arg, el) {
		for (const key in arg) {
			if (arg[key] !== on) {
				el.addEventListener(key, () => {
					arg[key]()
					schedule() // update
				})
			}
		}
	}
}


class KeysLooper {
	static embedded = true 
	init(arg, el) {
		this.el = el
		this.update(arg)
	}
	update(arg) {
		for (const key in arg) 
			if (arg[key] !== this.constructor) 
				this.loop(key, arg[key])
	}
	loop(key, val) {}
}

class set extends KeysLooper{
	loop(key, val) {
		this.el[key] = val
	}
}

class ottr extends KeysLooper {
	loop(key, val) {
		if (val) this.el.setAttribute(key, "")
		else this.el.removeAttribute(key)
	}
}

class cls extends KeysLooper {
	loop(key, val) {
		if (val) this.el.classList.add(key)
		else this.el.classList.remove(key)
	}
}

class style extends KeysLooper {
	loop(key, val) {
		this.el.style[key] = val
	}
}

const none = Symbol()
class attr extends KeysLooper{
	loop(key, val){
		if (val == none) return this.el.removeAttribute(key)
		this.el.setAttribute(key, val)
	}
}


class Put {
	static embedded = true
	static out = true
	prev = null
	init({ arg }, el) {
		this.el = el
		this.update(arg)
	}
	update({ arg }) {
		if (arg == this.prev) return 
		this.prev?.remove()
		this.el.after(arg)
		this.prev = arg

	}
}
const put = arg => ({ Put, arg })

// setup parts

const elem = new Proxy({}, {
	get(_, prop) {
		return function (strings, ...args) {
			return {
				Velo,
				tag: prop,
				strings,
				args,
			}
		}
	}
})


//               test
// -----------------------------------------
export const { div, li, span, b, i, p, h1, h2, h3, h4, h5, h6 } = elem

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

const mydiver = () => div`
	<button ${{ onn, click: e => state.gnum++ }}>g+</button>
	<button ${{ onn, click: e => state.gnum-- }}>g-</button>

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
