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
	dieCheck() {
		switch(this._phase) {
			case "none":
				throw new Error(".die() on a non-initialized ion")
			case "die": 
				throw new Error(".die() on a dead ion")
		}
		this._phase = "die"
	}
	// update, or replace if it's a different kind of ion's arg.
	// return null if updated, new ion if killed and inited own.
		// or no
	tick(arg) {
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

class VresArrayIon extends Ion {
	static out = true
	ions = []
	pins = []
	init(arg) {
		const { el } = this
		super.initCheck()
		this.update(arg)
	}
	update(arg) {
		super.updateCheck()
		const { el } = this
		console.log(this.ions.length)
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
				continue
			}
			const ionClass = ionic(vres)
			if (!this.ions[i]) {
				this.ions[i] = new ionClass(this.pins[i])
				this.ions[i].init(vres)
				continue
			}
			if (this.ions[i].constructor != ionClass) {
				this.ions[i].die()
				this.ions[i] = new ionClass(this.pins[i])
				this.ions[i].init(vres)
			} else {
				this.ions[i].update(vres)
			}
		}
		// no need to .pop the pins. they just sit in the document 
		// and we just get them if we have and need more. but ions makes 
		// ions make us iterate more even arg has less items. so we have to
		// cut the unnecessary parts of ions (the nulls at the end)
		// (when a small lengthed arg comes, the arg[i] == null .dies and =null)
		while (this.ions.length && !this.ions.at(-1)) this.ions.pop()
		el.nodeValue = this.ions.length
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
	if (Array.isArray(arg)) return VresArrayIon
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
	#render(vres) {
		const { strings, args, tag } = vres
		this.pins = []
		this.ions = []
		this.element = document.createElement(tag)
		const [html, ionClasses] = mark(vres)
		this.element.innerHTML = html
		for (const [i, IonClass] of ionClasses.entries()) {
			let pin = this.element.querySelector(`[v${i}]`)
			if (IonClass.out) {
				const textNode = document.createTextNode("")
				pin.replaceWith(textNode)
				pin = textNode
			}
			console.assert(pin, `broken html: couldn't query v${i} \n`, html)
			const ion = new IonClass(pin)
			ion.init?.(args[i])
			this.ions.push(ion)
			this.pins.push(pin)
		}
	}
	update(arg) {
		const { el } = this
		console.assert(isVres(arg), "Velo update expects vres, but got", arg)
		super.updateCheck()
		const vres = arg
		if (!this.isSame(arg)) {
			this.element.remove()
			this.#render(arg)
			el.after(this.element)
		} else for (const [i, pin] of this.pins.entries()) {
			const arg = vres.args[i]
			const ionClass = ionic(arg)  ////// ohhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
			if (this.ions[i].constructor == ionClass) {
				this.ions[i].update?.(arg)
			} else {
				this.ions[i].die?.()
				this.ions[i] = new ionClass(pin)
				this.ions[i].init?.(arg)
			}
		}
		this.last = arg
	}

	static out = true
	init(arg) {
		const { el } = this
		// console.assert(isVres(arg), "Velo init expects vres, not ", arg)
		// this init is already decided from arg in ionic, what's the point of checking the arg?
		super.initCheck()
		this.#render(arg)
		el.after(this.element)
		this.last = arg
	}
	die() {
		super.dieCheck()
		this.element.remove()
	}
	isSame(vres) {
		console.assert(isVres(vres), "Velo diff expects vres")
		if (this.last.strings.length != vres.strings.length) return false
		// if (this.last.args.length != vres.args.length) return false
		for(let i = 0; i < this.last.strings.length; i++) {
			if (this.last.strings[i] != vres.strings[i]) return false
		}
		return true
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
	refresh() {
		this.update('not necessary', this.html(this.state))
	}
}


// -----------------------------------------
const { div, p } = elem

// local is the argument that passed to profile()
// so mutating this is kinda dangerous
// that would be better. fn((props, local) => {
const profile = fn(props => {
	props.count ??= 0
	return div`
	<button ${{ on, click: e => props.count++ }} >
		u${props.count} just wait a little after click
	</button>
	`})



const randb = () => Math.random() > 0.5
const arca = () =>  
	// randb() ? "uffishuuuuuuuu" :
		randb() 
		? [
			div`la 1--------`,
			div`la 2-------- susoaf${Math.random()+'k'} moder flipcker`,
			div`la 3--------`,
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

const mydiver = () => div`
	<button 
		${{ set, disabled: randb() }}
		${{ on, click: e => alert('hi')}}>didi 
			${Math.random() + 'k'} limo
	</button>
	${randb() ? div`that's one` : div`and the other ${"hi"} ${Math.random()}`}
	${profile({count: 99})}
	${profile({count: 9})}
	<hr>
	${arca()}
	<hr>
	${randb() ? div`a vres` : "a string"}
`

// const myVelo = new Velo(document.querySelector("#app"))
// myVelo.init(mydiver())
// const update = () => myVelo.update(mydiver())
// setInterval(update, 400)

const myVelo = new Fn(document.querySelector("#app"))
myVelo.init(fn(mydiver)())
setInterval(()=>myVelo.update(fn(mydiver)()), 400)
