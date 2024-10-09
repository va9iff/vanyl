export class Velo  {
	#render({ strings, args, tag }) {
		this.pins = []
		this.ions = []
		this.element = document.createElement(tag)
		const [html, ionClasses] = mark(strings, ...args)
		this.element.innerHTML = html
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
	update(arg) {
		const vres = arg
		if (!this.isSame(arg)) {
			this.element.remove()
			this.#render(arg)
			this.el.after(this.element)
		} else for (const [i, pin] of this.pins.entries()) {
			const arg = vres.args[i]
			const ionClass = ionic(arg)
			if (this.ions[i].constructor == ionClass) {
				this.ions[i].update?.(arg)
			} else {
				this.ions[i].die?.()
				this.ions[i] = new ionClass()
				this.ions[i].init?.(arg, pin)
			}
		}
		this.last = arg
	}

	static out = true
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

class VresArrayIon  {
	static out = true
	ions = []
	pins = []
	init(arg, el) {
		this.el = el
		this.update(arg)
	}
	update(arg) {
		while (this.pins.length < arg.length) {
			const pin = document.createTextNode("")
			this.el.before(pin)
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
				this.ions[i] = new ionClass()
				this.ions[i].init(vres, this.pins[i])
				continue
			}
			if (this.ions[i].constructor != ionClass) {
				this.ions[i].die()
				this.ions[i] = new ionClass()
				this.ions[i].init(vres, this.pins[i])
			} else {
				this.ions[i].update(vres)
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



function mark(strings, ...args) {
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


function ionic(arg) {
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
				if (typeof val == "function" && val.ion) return val
			}
	}
	if (arg?.tag && arg?.strings && arg?.args) return Velo
	if (Array.isArray(arg)) return VresArrayIon
	console.log(arg)
	throw new Error("coulndn't find a ion for that argument ")
}

// simpler ions

const fn = fun => props => ({ fun, Fn, props })
// fn(fun)(props) -> fun(props) // with state
class Fn extends Velo {
	static ion = true
	state = {}
	init(arg, el) {
		this.state = arg.props || {}
		this.html = arg.fun
		super.init(arg.fun(this.state), el)
	}
	update(arg) {
		if (arg?.fun) this.html = arg.fun
		super.update(this.html(this.state))
	}
	refresh() {
		this.update('not necessary', this.html(this.state))
	}
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

class set {
	static ion = true 
	init(arg, el) {
		this.el = el
		this.update(arg)
	}
	update(arg) {
		for (const key in arg) 
			if (arg[key] !== set) 
				this.el[key] = arg[key]
	}
}

class on {
	static ion = true
	init(arg, el) {
		for (const key in arg)
			if (arg[key] !== on)
				el.addEventListener(key, arg[key])
	}
	die() {}
}

// setup parts

const elem = new Proxy({}, {
	get(_, prop) {
		return function (strings, ...args) {
			return {
				tag: prop,
				strings,
				args,
			}
		}
	}
})


//               test
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
`
class log {
	static ion = true
	static out = true
	init(arg, el) {
		console.log(el, arg.stuff)
	}
}

// const myVelo = new Velo(document.querySelector("#app"))
// myVelo.init(mydiver())
// const update = () => myVelo.update(mydiver())
// setInterval(update, 400)

const myVelo = new Fn()
myVelo.init(fn(mydiver)(), document.querySelector("#app"))
setInterval(()=>myVelo.update(fn(mydiver)()), 400)
