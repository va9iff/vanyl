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

const count = (()=>{
	let current = 0
	return () => current++
})()

// mark is an object that generates the string and holds the data to later 
// grab and the element from string and make a pin with the grabbed element

export class Mark {
	constructor(inTag = false){
		this.inTag = inTag
	}
	id = count()
	get unique(){
		return `V${this.id}`
	}
	get selector(){
		return `[${this.unique}]`
	}
	drop(){
		return this.inTag ? `${this.unique}` : `<wbr V${this.id}>`
	}
	// grabFrom(element){
		// return element.querySelector(this.selector)
	// }
}

export class Pin {
	constructor(mark, parent, arg){
		this.mark = mark
		this.node = parent.querySelector(mark.selector)
		this.node.removeAttribute(mark.selector)
		if (!mark.inTag) {
			const textNode = document.createTextNode("") // or erease at upt
			pin.element.replaceWith(textNode)
			pin.element = textNode
		}
		this.arg
	}
	isPin = true
	node = null
}

export function v() {
	return new VResult(...arguments)
}


// -> [string, pin[]]
export function markHtml(pinnable) {
	if (typeof pinnable == "string"){
		let mark = new Mark(false)
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
	updatePins(pinnable, pins){
		if (pinnable instanceof VResult){
			for (const pin of pins) {
				const arg = pinnable?.args?.[pin.i] // if undefined, resets the pin
				this.updatePin(pin, arg)
			}		
		} else if (pinnable.isPin) {
			for (const pin of pins) this.updatePin(pin, null)
		}

	}
	update(vResult) {
		this.updatePins(vResult, this.pins)
	}
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
		/*
		NO WE'LL USE KEYS. I DON'T LIKE THIS DYNAMIC SIZED ARRAYS.
		IF THERE'S THE KEY, OK. IF NOT, NOT.
		that's not even bad dev exp either.
		v`
			<ul>
				${data.map((item,key)=>v`
					<li ${{key}}>${item.text}</li>
				`)}
			</ul>
		`

		or maybe both as an option. I'm jus lil scared of keyless updates.
	*/
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

let vt = () =>
	Math.random() > 0.5 ? v`<span>that's from v</span>` : "textymishhhhhhhhhhhh"

let rendr = () => v`
	<button ${{
		disabled: Math.random()>0.5,
		onclick: () => console.log("clicked"),
	}}
	>hi </button>

	${v`
		<p>
			hi <i>my</i> <b>bro ${parseInt(Math.random() * 100)}</b>
		</p>
	`} <br>

	${ab()} <br>
	${vt()} <br>
	and here's the list<br>
`

let buttonA = () => v`<button
	${{ onclick: e => console.log(e.target.innerHTML) }}
	${k=>k.click()}
>a ${parseInt(Math.random() * 1000)}</button>`
let buttonB = () => v`<button
	${{ onclick: e => console.log(e.target.innerHTML) }}
	${k=>k.click()}
>b ${parseInt(Math.random() * 1000)}</button>`
let ab = () => (Math.random() > 0.5 ? buttonA() : buttonB())

let vr = rendr()
// let {strings, args} = vr
let [html, pins] = markHtml(vr)
document.body.innerHTML = html
let c = new VanylController(document.body, pins)

setInterval(() => {
	c.update(Math.random() > 0.5 ? rendr() : "hi????")
}, 500)
