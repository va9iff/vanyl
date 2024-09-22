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


const set = Symbol()
class SetIon {
	init(el, arg) {
		this.update(el, arg)
	}
	update(el, arg) {
		for (const key in arg) 
			if (arg[key] !== set) 
				el[key] = arg[key]
	}
}

class TextIon {
	out = true
	init(el, arg) {
		this.update(el, arg)
	}
	update(el, arg) {
		el.nodeValue = arg
	}
	die(el) {
		el.nodeValue = ""
	}
}

const on = Symbol()
class OnIon {
	init(el, arg) {
		for (const key in arg)
			if (arg[key] !== on)
				el.addEventListener(key, arg[key])
	}
}

function ionic(arg) {
	if (typeof arg == "string" || typeof arg == "number") return TextIon
	for (const key in arg) {
		const val = arg[key]
		if (val == set) return SetIon
		if (val == on) return OnIon
	}
	if (arg.tag && arg.strings && arg.args) return Velo
	console.log(arg)
	throw new Error("coulndn't find a ion for that argument ")
}

function mark({ strings, args }) {
	let htmlString = ""
	const ions = []
	for (let i = 0; i < strings.length - 1; i++) {
		const ionClass = ionic(args[i])
		const ion = new ionClass()
		ions.push(ion)
		htmlString += strings[i] + (ion.out ? `<wbr v${i}>` : `v${i}`)
	}
	htmlString += strings[strings.length - 1]
	return [htmlString, ions]
}

export class Velo {
	element = null
	pins = []
	render(vres) {
		const { strings, args, tag } = vres
		this.element = document.createElement(tag)
		;[this.element.innerHTML, this.ions] = mark(vres)
		for (let i = 0; i < strings.length - 1; i++) {
			let el = this.element.querySelector(`[v${i}]`)
			if (this.ions[i].out) {
				const textNode = document.createTextNode("")
				el.replaceWith(textNode)
				el = textNode
			}
			this.pins.push(el)
			this.ions[i].init?.(el, args[i])
		}
		this.vres = vres
	}
	out = true
	init(el, arg) {
		this.render(arg)
		el.after(this.element)
	}
	die() {
		this.element.remove()
	}
	// diff(arg) {
	// 	if (this.vres.strings.length != arg.strings.length) return true
	// 	if (this.vres.args.length != arg.args.length) return true
	// 	for(let i = 0; i < this.vres.strings.length; i++) 
	// 		if (this.vres.strings[i] != arg.strings.length) return true
	// }
	update(vres) {
		console.assert(this.vres.strings.length == vres.strings.length)
		for (const [i, arg] of this.vres.args.entries()) {
			const ionClass = ionic(arg)
			if (this.ions[i].constructor == ionClass 
				&& this.ions[i].diff?.(vres.args[i])) {
				this.ions[i].update?.(this.pins[i], vres.args[i])
			} else {
				this.ions[i].die?.(this.pins[i], vres.args[i])
				this.ions[i] = new ionClass()
				this.ions[i].init?.(this.pins[i], vres.args[i])
			}
		}
	}
}

const { div } = elem
const anodiver = () => div`
	<h1>this is another div</h1>
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
	${randb() ? div`that's one` : div`and the other`}
	`

console.log(...mark(mydiver()))
const myVelo = new Velo()
myVelo.render(mydiver())
document.body.appendChild(myVelo.element)
setInterval(()=>myVelo.update(mydiver()), 500)
console.log(myVelo.element)

