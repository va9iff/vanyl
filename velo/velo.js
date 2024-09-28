// predefine array lengths lke new Array(arg.strings.length) to avoid reallocations


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
		this.el = el || console.warn("no element was givne")
		// 	and init expects only the arg
	}
	// static out = false // ? put a <wbr> and query that : else query the element
	// ?element: is the element that this Ion is associated with
	_phase = "none"
	initCheck(arg) {
		const { el } = this
		// if (!el) throw new Error(".init requires first argument (the element)") // actually we don't pass el to super init lel :p
		if (!this.die) console.warn(`ion with no .die function was initialized: ${this.constructor.name}`)
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
	updateCheck(arg) {
		const { el } = this
		switch (this._phase) {
			case "none": 
				throw new Error(".update() requires .init() to be called before")
			case "die":
				throw new Error(".update() on a dead ion")
		}
		this._phase = "update"
	}
	dieCheck(el, arg) {
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
		super.initCheck()
		this.update(arg)
	}
	update(arg) {
		const { el } = this
		super.updateCheck()
		for (const key in arg) 
			if (arg[key] !== set) 
				el[key] = arg[key]
	}
	die() {}
}

class TextIon extends Ion{
	static out = true
	init(arg) {
		const { el } = this
		super.initCheck()
		this.element = document.createTextNode(arg)
		el.after(this.element)
	}
	update(arg) {
		const { el } = this
		super.updateCheck()
		this.element.nodeValue = arg
	}
	die() {
		super.dieCheck()
		this.element.remove()
	}
}

// I don't think using ions .element is a better idea.
// we would need to .pop them to ions[i]'s element to 
// be at the correct place. if we ions[5].die() then 
// ions[6]'s element is at 5. and how can we insert to be
// at 5? we should ions.splice(5,0,1) but hits performance
// and kinda more to think about and keep trace of.
// but ions[5] just being null and having an exact pin in 
// the document is straightforward
class VresArrayIon extends Ion {
	static out = true
	ions = []
	pins = []
	init(arg) {
		const { el } = this
		super.initCheck()
		this.update(el, arg)
	}
	diff(arg) {
		return !Array.isArray(arg)
	}
	update(arg) {
		super.updateCheck()
		const { el } = this
		while (this.pins.length < arg.length) {
			const pin = document.createTextNode("")
			el.before(pin)
			this.pins.push(pin)
		}
		for (let i = 0; i < Math.max(this.ions.length, arg.length); i++) {
			const vres = arg[i]
			if (!arg[i]) {
				this.ions[i]?.die()
				this.ions[i] = null
				break
			}
			if (!this.ions[i]) {
				this.ions[i] = new Velo(this.pins[i])
				this.ions[i].init(vres)
				break
			}
			if (this.ions[i].diff(vres)) {
				this.ions[i].die()
				this.ions[i] = new Velo(this.pins[i])
				this.ions[i].init(vres)
			} else {
				this.ions[i].update(vres)
			}
		}
	}
	die() {
		for (const ion of this.ions) ion?.die()
		for (const pin of this.pins) pin.remove()
		this.ions = []
		this.pins = []
	}
}

const on = Symbol()
class OnIon extends Ion{
	init(arg) {
		const { el } = this
		super.initCheck()
		for (const key in arg)
			if (arg[key] !== on)
				el.addEventListener(key, arg[key])
	}
	die() {}
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
		super.initCheck()
		console.log('inited a new one' + Math.random())
		this.#render(arg)
		el.after(this.element)
	}
	die() {
		super.dieCheck()
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
		super.updateCheck()
		const vres = arg
		console.assert(this.vres.strings.length == vres.strings.length, "different vres", this.vres.strings, arg.strings)
		for (const [i, pin] of this.pins.entries()) {
			const ionClass = ionic(this.vres.args[i]) 
			const arg = vres.args[i]
			if (this.ions[i].constructor == ionClass 
				&& !this.ions[i].diff?.(arg)) {
				this.ions[i].update?.(arg)
			} else {
				this.ions[i].die?.()
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

// -----------------------------------------

const profile = fn(state => div`
	<button ${{ on, click: e => state.count = state.count ? state.count+1: 9}}>u${state.count} just wait a little after click</button>
	`)

const arca = () => 
	randb() ? [
		div`that's div 1`,
		div`and that's ${Math.random()+'k'} moder flipcker`,
		p`and even a p`
	] 
		// : randb() ? 
		// "fasadistu"
	: [
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
setInterval(()=>myVelo.update(mydiver()), 300)
console.log(myVelo.element)

