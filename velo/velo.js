export class Velo  {
	static out = true
	static embedded = true
	query(container, i) {
		// cuz V wants to container.content.querySelector()
		return container.querySelector(`[v${i}]`)
	}
	render({ strings, args }, container) {
		const [html, ionClasses] = mark(strings, ...args)
		container.innerHTML = html
		this.pins = []
		this.ions = []
		for (const [i, IonClass] of ionClasses.entries()) {
			let pin = this.query(container, i)
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
		return container
	}
	update(vres) {
		if (!this.isSame(vres)) {
			this.die()
			this.fresh(vres)
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
		this.fresh(arg)
	}
	fresh(arg) {
		this.element = this.render(arg, document.createElement(arg.tag))
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

export const v = (strings, ...args) => ({ strings, args, V})
class V extends Velo {
	query(container, i) {
		return container.content.querySelector(`[v${i}]`)
	}
	fresh(arg) {
		this.tmp = this.render(arg, document.createElement("template"))
		this.nodes = []
		console.log(this.tmp.content.children)
		for (const child of this.tmp.content.children) {
			this.nodes.push(child)
			console.log(child, child.innerHTML)
		}
		for (const child of this.nodes) {
			this.el.before(child)
		}
		this.last = arg
	}
	die() {
		for (const child of this.nodes) {
			child.remove()
		}
		this.nodes = []
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

export const orderless = (array, fun, key = "key") => ({ array, fun, key })
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

export const fn = fun => props => ({ fun, Fn, props })
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

export class custom {
	static embedded = true
	init(arg, el) {
		arg.init?.(el)
		this.el = el
	}
	update(arg) {
		arg.update?.(this.el)
	}
	die(arg) {
		arg.die?.(this.el)
	}
}

// discoruged cuz still makes the element updates, just doesn't show.
// instead use ${condition && component()} syntax or ternary
// ${ condition ? component() : placeholder }
class IfIon {
	init(arg, el) {
		this.el = el
		this.update(arg)
	}
	update(arg) {
		this.el.hidden = !arg.if
	}
	
}


export class on {
	static embedded = true
	init(arg, el) {
		for (const key in arg)
			if (arg[key] !== on)
				el.addEventListener(key, arg[key])
	}
}

export class onn {
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

export class set extends KeysLooper{
	loop(key, val) {
		this.el[key] = val
	}
}

export class ottr extends KeysLooper {
	loop(key, val) {
		if (val) this.el.setAttribute(key, "")
		else this.el.removeAttribute(key)
	}
}

export class cls extends KeysLooper {
	loop(key, val) {
		if (val) this.el.classList.add(key)
		else this.el.classList.remove(key)
	}
}

export class style extends KeysLooper {
	loop(key, val) {
		this.el.style[key] = val
	}
}

export const none = Symbol()
export class attr extends KeysLooper{
	loop(key, val){
		if (val == none) return this.el.removeAttribute(key)
		this.el.setAttribute(key, val)
	}
}


export const put = arg => ({ Put, arg })
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
	if (arg?.hasOwnProperty?.("if") && Object.keys(arg).length == 1) return IfIon
	throw new Error("coulndn't find a ion for that argument ")
}


export const elem = new Proxy({}, {
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


const apps = []
export const state = {} 
export function app(selector, fun) {
	if (typeof selector == "string") selector = document.querySelector(selector)
	const ion = new Fn()
	apps.push(ion)
	ion.init({ fun, props: state }, selector)
}
// update all Fn components that are defined with app()
export function update() {
	for (const app of apps) app.update({ props: state})
	return true
}

let uptodate = false
export const schedule = () => {
	uptodate = false
	setTimeout(()=>{
		if (uptodate) return
		update()
		uptodate = true
	})
}

export const { div, li, span, b, i, p, h1, h2, h3, h4, h5, h6 } = elem

