const elem = new Proxy({}, {
	get(_, prop) {
		return function (strings, ...args) {
			// that's called a vres
			return {
				tag: prop,
				strings,
				args,
			}
		}
	}
})

const isVres = arg => arg?.tag && arg?.strings && arg?.args

class Ion {
	constructor(el) {
		this.el = el
		// 	and init should expect only the arg
	}
	// static out = false // ? put a <wbr> and query that : else query the element
	// ?element: is the element that this Ion is associated with
	_phase = "none"
	init(arg) {
		const { el } = this
		// if (!el) throw new Error(".init requires first argument (the element)") // actually we don't pass el to super init lel :p
		switch (this._phase) {
			case "init": 
				throw new Error("consecutive .init() instead of using .update() after")
			case "update":
				throw new Error(".init() on an already initialized ion")
			case "die":
				throw new Error(".init() on a dead ion")
		}
		this._phase = "init"
	}
	update(arg) {
		const { el } = this
		switch (this._phase) {
			case "none": 
				throw new Error(".update() requires .init() to be called before")
			case "die":
				throw new Error(".update() on a dead ion")
		}
		this._phase = "update"
	}
	die(el, arg) {
		switch(this._phase) {
			case "none":
				throw new Error(".die() on a non-initialized ion")
			case "die": 
				throw new Error(".die() on a dead ion")
		}
		this._phase = "die"
	}
}

const set = Symbol()
class SetIon extends Ion {
	init(arg) {
		const { el } = this
		super.init()
		this.update(arg)
	}
	update(arg) {
		const { el } = this
		super.update()
		for (const key in arg) 
			if (arg[key] !== set) 
				el[key] = arg[key]
	}
}

class TextIon extends Ion{
	static out = true
	init(arg) {
		const { el } = this
		super.init()
		this.element = document.createTextNode(arg)
		el.after(this.element)
	}
	update(arg) {
		const { el } = this
		super.update()
		this.element.nodeValue = arg
	}
	die(el) {
		super.die()
		this.element.remove()
	}
}

// we can generalize this to any ion array. 
// just add a text node after the given text node.
// pins = [] and pins[i] ||= createTextNode
// then we can easily pass the el.
// so we will have n text nodes just for n elemented array :/
// or the best way is to use .element of the previous ion. 
// not sure if it's the best but anyways. array should
// only contain out Ions. they're currently just Velo and TextIons.
// so just have .element on them.

class VresArrayIon extends Ion {
	static out = true
	ions = []
	init(arg) {
		const { el } = this
		super.init()
		// let curr = el
		// for (const item of arg) {
		// 	const velo = new Velo()
		// 	velo.init(el,item)
		// 	curr = velo.element
		// 	this.ions.push(velo)
		// }
		this.update(el, arg)
	}
	diff(arg) {
		return !Array.isArray(arg)
	}
	update(arg) {
		const { el } = this
		console.log('update Array')
		super.update()
		var last = el
		for (let i = 0; i < Math.max(this.ions.length, arg.length); i++) {
			const vres = arg[i]
			if (!arg[i]) {
				this.ions[i]?.die(last, vres)
				this.ions[i] = null
				break
			}
			if (!this.ions[i]) {
				console.log(i, arg[i], this.ions[i])
				this.ions[i] = new Velo(last)
				this.ions[i].init(vres)
				last = this.ions[i].element
				break
			}
			if (this.ions[i].diff(vres)) {
				this.ions[i].die(last, vres)
				this.ions[i] = new Velo(last)
				this.ions[i].init(vres)
			} else {
				this.ions[i].update(vres)
			}
			// if (this.ions[i].diff(arg[i])) {
			// 	this.ions[i].die(el, arg)
			// 	this.ions[i] = new Velo()
			// 	this.ions[i].init(last, arg)
			// }
		}
	}
	die() {
		console.log('todo: kill array')
	}
}

const on = Symbol()
class OnIon extends Ion{
	init(arg) {
		const { el } = this
		super.init()
		for (const key in arg)
			if (arg[key] !== on)
				el.addEventListener(key, arg[key])
	}
}

function ionic(arg) {
	switch(typeof arg) {
		case "number":
		case "string":
		case "undefined":
			return TextIon
	}
	for (const key in arg) {
		const val = arg[key]
		if (val == set) return SetIon
		if (val == on) return OnIon
		if (val == Fn) return Fn
	}
	if (isVres(arg)) return Velo
	if (isVres(arg[0])) return VresArrayIon
	console.log(arg)
	throw new Error("coulndn't find a ion for that argument ")
}

function mark({ strings, args }) {
	let htmlString = ""
	const ionClasses = []
	for (let i = 0; i < strings.length - 1; i++) {
		const ionClass = ionic(args[i])
		ionClasses.push(ionClass)
		htmlString += strings[i] + (ionClass.out ? `<wbr v${i}>` : `v${i}`)
	}
	htmlString += strings[strings.length - 1]
	return [htmlString, ionClasses]
}

export class Velo extends Ion {
	element = null
	pins = []
	#render(vres) {
		const { strings, args, tag } = vres
		this.ions = []
		this.element = document.createElement(tag)
		const [html, ionClasses] = mark(vres)
		this.element.innerHTML = html
		for (const [i, IonClass] of ionClasses.entries()) {
			let el = this.element.querySelector(`[v${i}]`)
			if (IonClass.out) {
				const textNode = document.createTextNode("")
				el.replaceWith(textNode)
				el = textNode
			}
			console.assert(el, `broken html: couldn't query v${i} \n`, html)
			const ion = new IonClass(el)
			// todo is -- ion.elment = el somehow. maybe in constructor
			this.ions.push(ion)
			this.pins.push(el)
			this.ions[i].init?.(args[i])
		}
		this.vres = vres
	}
	static out = true
	init(arg) {
		const { el } = this
		console.assert(isVres(arg), "Velo init expects vres, not ", arg)
		super.init()
		console.log('inited a new one' + Math.random())
		this.#render(arg)
		el.after(this.element)
	}
	die(el, arg) {
		super.die()
		this.element.remove()
	}
	diff(arg) {
		console.assert(isVres(arg), "Velo diff expects vres")
		if (!arg) return true
		if (this.vres.strings.length != arg.strings.length) return true
		if (this.vres.args.length != arg.args.length) return true
		for(let i = 0; i < this.vres.strings.length; i++) {
			if (this.vres.strings[i] != arg.strings[i]) return true
		}
		console.log("SAME")
	}
	update(arg) {
		const { el } = this
		console.assert(isVres(arg), "Velo update expects vres, but got", arg)
		super.update()
		const vres = arg
		console.assert(this.vres.strings.length == vres.strings.length, "different vres", this.vres.strings, arg.strings)
		for (const [i, pin] of this.pins.entries()) {
			const ionClass = ionic(this.vres.args[i]) 
			const arg = vres.args[i]
			if (this.ions[i].constructor == ionClass 
				&& !this.ions[i].diff?.(arg)) {
				this.ions[i].update?.(arg)
			} else {
				this.ions[i].die?.(pin, arg)
				this.ions[i] = new ionClass(pin)
				this.ions[i].init?.(arg)
			}
		}
	}
}

function fn(fun) {
	return function (props){
		return { fun, Fn, props }
	}
}
class Fn extends Velo {
	state = {}
	init(arg) {
		const { el } = this
		this.state = arg.props || {}
		this.html = arg.fun
		super.init(arg.fun(this.state))
	}
	update(arg) {
		if (arg?.fun) this.html = arg.fun
		super.update(this.html(this.state))
	}
	diff(arg) {
		super.diff(arg?.fun?.(this.state))
	}
	refresh() {
		this.update('not necessary', this.html(this.state))
	}
}

const profile = fn(state => div`
	<button ${{ on, click: e => state.count = state.count ? state.count+1: 9}}>u${state.count} just wait a little after click</button>
	`)

// idk how to do it. new Fn instance on all args looks bad.
// cuz Fn inherits from Velo which allocates arrays on construction
// profile({ name: "VI" }) // -> Fn with this.vres 

// or like this
// profile({ name: "Hi" }) // Fnn that just constructs Velo when needed
// class Fnn extends Ion {
// 	state = {}
// 	init(el, arg) {
// 		this.velo = new Velo()
// 		this.velo.init(el, arg)
// 		               // idk it got much flaws. it can't determine when it should die
// 	}
// 	update(el) {
// 		this.velo.update(el, this.html(this.state))
// 	}
// 	die(el, arg) {
// 		this.velo.die(el, arg)
// 	}
// 	refresh() {
// 		this.update(null, this.html(this.state))
// 	}
// }
//
// // wtf is this
// function app(elOrSelector, fun) {
// 	const el = typeof elOrSelector == "string"
// 		? document.querySelector(`#${elOrSelector}`) 
// 		: elOrSelector
// 	const textNode = document.createTextNode("")
// 	el.appendChild(textNode)
// 	const velo = new Velo()
// 	velo.init(textNode, fun())
//
// }

const arca = () => 
	randb() ? [
		div`that's div 1`,
		div`and that's ${Math.random()+'k'} moder flipcker`,
		p`and even a p`
	] : [
		div`twooo`,
		div`yaaa`
	]

const { div, p } = elem
const anodiver = () => div`
	<h1>this is another div${"hi"} alksfdj ${"bye"} sflkjh ${"fa"+8}</h1>
`
const randb = () => Math.random() > 0.5
const mydiver = () => div`
	<h1>jf</h1> jflkasf 
	<button 
		${{ set, disabled: randb() }}
		${{ on, click: e => alert('hi')}}>didi 
			${Math.random() + 'k'} limo
	</button>
	<h1>here another</h1>
	${randb() ? div`that's one` : div`and the other ${"hi"} ${Math.random()}`}
	<h3>now it's time to test statefuls</h3>
	${profile({count: 99})}
	<h3>cool. now arrays []</h3>
	${arca()}
	`

console.log(...mark(mydiver()))
const myVelo = new Velo(document.querySelector("#app"))
myVelo.init(mydiver())
document.body.appendChild(myVelo.element)
setInterval(()=>myVelo.update(mydiver()), 1000)
console.log(myVelo.element)

