export class VResult {
	constructor(strings, ...args) {
		this.strings = strings
		this.args = args
	}
	isSame(_vResult) {
		if (!_vResult) return false
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
		// definer
		isPin: true,

		// defined @markHtml
		// arg, i, inTag

		// core
		element: null, // text node for marking. won't be removed.
		now: null, // used to assign to last at the end
		last: null, // the now value. means the type of last pin update.

		// functions
		callNext: true,

		// vResult arg
		vResultLast: null, // to check - update or replace
		vResultElem: null, // the element of vResult. refer to remove.
		controller: null,

		// lists
		list: [
			/*pin - {element, controller}*/
		],
	}
}

export function markHtml(pinnable) {
	if (typeof pinnable == "string"){
		return [`<wbr V0>`, [{ ...pinProperties(), arg: pinnable, i, inTag: true }]]
	}
	else if (pinnable instanceof VResult){
		const { strings, args } = pinnable
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
	} else {
		throw new Error('got an unexpected type for pinnable')
	}
}

export function processHtml(element, pins) {
	for (const pin of pins) {
		pin.element = element.querySelector(`[V${pin.i}]`)
		pin.element.removeAttribute(`V${pin.i}`)
		if (pin.inTag) {
		} else {
			const textNode = document.createTextNode("") // or erease at upt
			pin.element.replaceWith(textNode)
			pin.element = textNode
		}
	}
}

function markedFirstChild(vr) {
	const [html, pins] = markHtml(vr)
	const domik = new DOMParser().parseFromString(html, "text/html")
	return [domik.body.firstElementChild, pins]
}


const updater = Symbol("updater")

// pins are never alone. they're stored in VanylController but tbh why
class VanylController {
	constructor(root, pinss) {
		this.pins = pinss
		this.root = root
		processHtml(this.root, this.pins)
	}
	// pins are the ${}s in the vResult. so it NEEDS a vResult
	updatePins(pinnable, pins){
		if (pinnable instanceof VResult){
			for (const pin of pins) {
				const arg = pinnable?.args?.[pin.i] // if undefined, resets the pin
				this.updatePin(pin, arg)
			}		
		} else if (pinnable.isPin) {
			for (const pin of pins) this.updatePin(pin, null)
		}
			// instead of calling it vResult, we should call it pinnable.
			// vResult is the most meaningful pinnable thing.
			// but it can be string, null as well.
			// and then, we should treat it like a single pin 
			// instead of something that has a multiple pins.

			// so pinnables are either vResult with multiple pins
			// or a single pin
	}
	update(vResult) {
		this.updatePins(vResult, this.pins)
	}
	// used to update/create/remove of text/vResult/(element)
	updatePin(pin, arg) {
		if (pin.inTag) {
			if (typeof arg == "object") {
				this.updateProps(pin.element, arg, pin.arg)
				pin.arg = arg
				pin.now = "props"
			} else if (typeof arg == "function") {
				pin.now = "function"
				this.updateFunction(pin, arg)
			}
		} else {
			if (arg instanceof VResult) {
				pin.now = "VResult"
				this.updateVResult(pin, arg)
			} else if (pin.last == "VResult")
				this.resetVResult(pin, arg)
			if (typeof arg == "string" || typeof arg == "number") {
				pin.now = "text"
				this.updateText(pin, arg)
			} else if (pin.last == "text") {
				this.resetText(pin, arg)
			}
			// if (Array.isArray(arg)) {
			// 	pin.now = "list"
			// 	this.updateList(pin, arg)
			// } else if (pin.last == "list") {
			// 	this.resetList(pin, arg)
			// }
		}

		pin.last = pin.now
	}
	updateVResult(pin, arg){
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
	}
	resetVResult(pin, arg){
		pin.vResultElem.remove() // not ?.remove() cuz .last ensures before call
		pin.vResultLast = null
	}
	updateText(pin, arg){
		console.log(arg)
		pin.element.nodeValue = arg
	}
	resetText(pin, arg){
		pin.element.nodeValue = ""
	}
	updateProps(target, props, oldProps = {}) {
		for (let prop in props) {
			if (props[prop] !== oldProps[prop]) {
				target[prop] = props[prop]
			}
		}
	}
	updateFunction(pin, arg){
		if (pin.callNext) pin.callNext = arg(pin.element) == updater
	}
}

