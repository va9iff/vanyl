export class VResult {
	constructor(strings, ...args) {
		this.strings = strings
		this.args = args
	}
	isSame(_vResult) {
		return (
			this.strings.length == _vResult.strings.length &&
			this.strings.every((s, i) => this.strings[i] == _vResult.strings[i])
		)
	}
}
export function v() {
	return new VResult(...arguments)
}

export function pinProperties() {
	return {
		// defined @markHtml
		// arg, i, inTag

		// core
		element: null, // text node for marking. won't be removed.

		// functions
		callNext: true,

		// vResult arg
		vResultLast: null, // to check - update or replace
		vResultElem: null, // the element of vResult. refer to remove.
		controller: null,

		// lists
		listLast: [
			/*{element, controller}*/
		],
	}
}

export function markHtml(vResult) {
	const { strings, args } = vResult
	let [html, pins, lt, gt] = ["", [], 0, 0]
	for (let i = 0; i < args.length; i++) {
		const arg = args[i],
			string = strings[i]
		html += string
		gt = gt + string.split(">").length
		lt = lt + string.split("<").length
		const pin = { ...pinProperties(), arg, i, inTag: lt > gt }
		if (pin.inTag) html += ` V${i} `
		else html += `<wbr V${i}>`
		pins.push(pin)
	}
	html += strings.at(-1)
	return [html, pins]
}

const updater = Symbol("updater")

class VanylController {
	constructor(root, pinss) {
		// let [html, pinss] = markHtml(vResult)
		this.pins = pinss
		this.root = root
		// root.innerHTML = html
		this.process(pinss)
	}
	process(pins) {
		for (const pin of pins) {
			pin.element = this.root.querySelector(`[V${pin.i}]`)
			pin.element.removeAttribute(`V${pin.i}`)
			if (pin.inTag) {
			} else {
				const textNode = document.createTextNode("") // or erease at upt
				pin.element.replaceWith(textNode)
				pin.element = textNode
			}
		}
	}
	update(vResult) {
		for (const pin of this.pins) {
			const arg = vResult.args[pin.i]
			// for the old
			pin.element.nodeValue &&= ""
			if (!(arg instanceof VResult)) {
				pin.vResultElem?.remove()
				pin.vResultLast = null
			}
			if (!Array.isArray(arg)) {
				while (pin.listLast.length) pin.listLast.pop().element.remove()
			}

			// for the new
			if (pin.inTag) {
				if (typeof arg == "object") {
					this.updateProps(pin.element, arg, pin.arg)
					pin.arg = arg
				} else if (typeof arg == "function") {
					if (pin.callNext) pin.callNext = arg(pin.element) == updater
				}
			}
			// else if (Array.isArray(arg)) {
			// for (const pin of pin.listLast) {

			// }
			// pin.controller = new VanylController(this.root, )
			// }
			else this.updatePin(pin, arg)
		}
	}
	updatePin(pin, arg) {
		if (arg instanceof VResult) {
			if (pin.vResultLast?.isSame(arg)) {
				pin.controller.update(arg)
			} else {
				const [el, controllerpin] = markedFirstChild(arg)
				pin.element.after(el)
				pin.vResultElem?.remove() // needs in most palces
				pin.vResultElem = el
				pin.controller = new VanylController(this.root, controllerpin)
				pin.controller.update(arg)
			}
			pin.vResultLast = arg
		} else if (typeof arg == "string" || typeof arg == "number") {
			pin.element.nodeValue = arg
		}
	}
	updateProps(target, props, oldProps = {}) {
		for (let prop in props) {
			if (props[prop] !== oldProps[prop]) {
				target[prop] = props[prop]
			}
		}
	}
}

function markedFirstChild(vr) {
	const [html, pins] = markHtml(vr)
	const domik = new DOMParser().parseFromString(html, "text/html")
	return [domik.body.firstElementChild, pins]
}

// function controlled(vr) {
// 	const [element, pins] = markedFirstChild(vr)
// 	return new VanylController(element, pins)
// }

let vt = () =>
	Math.random() > 0.5 ? v`<span>that's from v</span>` : "textyyyytextyyyyy"

let f = (a = false, b = 0) => v`
	<button ${{
		disabled: a,
		onclick: () => console.log("clicked"),
	}}
	>hi
	</button>

	${v`
		<p>
			hi <i>my</i> <b>bro ${parseInt(Math.random() * 100)}</b>
		</p>
	`} <br>
	${ab()} <br>
	${vt()}
`

let buttonA = () => v`<button
	${{ onclick: () => console.log("fasad") }}
>a ${parseInt(Math.random() * 1000)}</button>`
let buttonB = () => v`<button
	${{ onclick: () => console.log("fasad") }}
>b ${parseInt(Math.random() * 1000)}</button>`
let ab = () => (Math.random() > 0.5 ? buttonA() : buttonB())

let vr = f()
// let {strings, args} = vr
let [html, pins] = markHtml(vr)
document.body.innerHTML = html
let c = new VanylController(document.body, pins)

setInterval(() => {
	c.update(f(Math.random() > 0.5))
}, 500)
