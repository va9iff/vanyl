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

const updater = Symbol("updater")

class VanylController {
	constructor(root, pinss) {
		// let [html, pinss] = markHtml(vResult)
		this.pins = pinss
		this.root = root
		// root.innerHTML = html
		/*this.process(pinss)*/
		processHtml(this.root, this.pins)
	}
/*	process(pins) {
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
	}*/
	updatePins(vResult, pins){
		for (const pin of pins) {
			const arg = vResult?.args?.[pin.i]
			this.updatePin(pin, arg)
		}		
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
				this.updateFunction()
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
			if (Array.isArray(arg)) {
				pin.now = "list"
				this.updateList(pin, arg)
			} else if (pin.last == "list") {
				this.resetList(pin, arg)
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
	updateList(pin, arg){
		pin.list[arg.length-1] ??= undefined

		//instead of this.updatePins we should use listPinsController.updatePins

		//actually it does 0 difference since the iterations are determined by 
		//the argument. so there's no difference. it just matters for the root
		//which is this.root but should be el if we want to narrow some query.
		//but then the props won't work for the top level element. it's kinda 
		//messed up now but I believe I can find a better way. everything 
		//has just been better and better. except my breakup.
		for (const [i, listItem] of pin.list.entries()){
			const listArg = arg[i]
			if (listItem?.listArg.isSame?.(listArg)) {
				this.updatePins(listArg, listItem.listPins)
			}
			else if (listItem){
				listItem.el.remove()
				const [el, listPins] = markedFirstChild(listArg)
				pin.element.before(el)
				const listPinsController = new VanylController(this.root, listPins)
				pin.list[i] = {listPins,listArg, el, listPinsController}
				this.updatePins(listArg, listPins)
			}
			else if (listArg){
				const [el, listPins] = markedFirstChild(listArg)
				pin.element.before(el)
				const listPinsController = new VanylController(this.root, listPins)
				pin.list[i] = {listPins,listArg, el, listPinsController}
				this.updatePins(listArg, listPins)
			} else {
				listItem.el.remove()
			}
		}
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

function markedFirstChild(vr) {
	const [html, pins] = markHtml(vr)
	const domik = new DOMParser().parseFromString(html, "text/html")
	return [domik.body.firstElementChild, pins]
}

// function controlled(vr) {
// 	const [element, pins] = markedFirstChild(vr)
// 	return new VanylController(element, pins)
// }

let k = 0

let list = ()=>{
	k++
	if (k<=2) return [
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000)
	]

	if (k<=4) return [
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
	]

	if (k<=6) return [
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000)
	]

	return Math.random() > 0.5 ? [
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000)
	] : 
	[
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000),
		parseInt(Math.random()*1000)
	]
}

let vt = () =>
	Math.random() > 0.5 ? v`<span>that's from v</span>` : "textymishhhhhhhhhhhh"

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
	${vt()} <br>
	and here's the list<br>
	${list().map((num,i)=>Math.random()<0.5? v`<b>bo${0}b<br></b>`  : v`
		<b>${i}hi dude ${num} <br></b>
		`)}
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
