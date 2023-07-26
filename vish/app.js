// vish = string || numberr || vResult || vish[] || (?| element)
// pin = stores element and data of associated vishes
// arg = vish || obj for props

export class VResult {
	constructor(strings, ...args) {
		this.strings = strings
		this.args = args
	}
	isSame(_vResult) {
		if (!_vResult) return false
		if (! (vResult instanceof VResult)) return false
		return (
			this.strings.length == _vResult.strings.length &&
			this.strings.every((s, i) => this.strings[i] == _vResult.strings[i])
		)
	}
}

class Pin {
	i = 0
	arg = null
	inTag = false
	constructor(props){
		for (const prop in props)
			this[prop] = props[prop]
	}
	isPin = true

	element =  null // text node for marking. won't be removed. or props element
	last =  null // the now value. means the type of last pin update.

	// functions
	callNext =  true

	// vResult arg
	// lastVResultC =  v`` // to check - update or replace vResult
	lastVResultC = new Controller(v``)
	lastList =  [/*controller*/]
}

export function v() {
	return new VResult(...arguments)
}

export function markHtml(vish) {
	if (vish instanceof VResult) {
		const { strings, args } = vish
		let [html, pins, lt, gt] = ["", [], 0, 0]
		for (let i = 0; i < args.length; i++) {
			const arg = args[i],
				string = strings[i]
			html += string
			gt = gt + string.split(">").length
			lt = lt + string.split("<").length
			const pin = new Pin({arg, i, inTag: lt > gt})
			if (pin.inTag) html += ` V${i} `
			else html += `<wbr V${i}>`
			pins.push(pin)
		}
		html += strings.at(-1)
		return [html, pins]
	}
	else if (typeof vish == "string"){
		return [`<wbr V${0}>`, new Pin({arg: vish, inTag: true, i: 0})]
	}
}

export function processHtml(parent, pins) {
	for (const pin of pins) {
		pin.element = parent.querySelector(`[V${pin.i}]`)
		pin.element.removeAttribute(`V${pin.i}`)
		if (pin.inTag) {
		} else {
			const textNode = document.createTextNode("") // or erease at upt
			pin.element.replaceWith(textNode)
			pin.element = textNode
		}
	}
}

export function firstChildWithProcessedPins(vish) {
	const [html, pins] = markHtml(vish)
	const domik = new DOMParser().parseFromString(html, "text/html")
	processHtml(domik.body, pins)
	let elementOrTextNode = domik.body.firstElementChild || domik.body.childNodes[0]
	elementOrTextNode ||= document.createTextNode("")
	return [elementOrTextNode, pins]
}

class Controller {
	root = null
	pins = []
	vish = v``
	constructor(vish) {
		[this.root, this.pins] = firstChildWithProcessedPins(vish)
		this.vish = vish
		this.updateWith(vish)
	}
	to(parent) {
		parent.appendChild(this.root)
	}
	updatePins(vResult){
		for (const [i, arg] of vResult.args.entries()){
			this.updateVish(this.pins[i], arg)
		}
	}
	updateProps(){}
	updateVish(pin, vish) {
		if (typeof vish == "string" || typeof vish == "number") {
			console.log('cish')
			pin.element.nodeValue = vish
		} else if (vish instanceof VResult){
			if (vish.isSame(pin.lastVResultC.vish)){
				pin.lastVResultC.updateWith(vish)
			} else {
				pin.lastVResultC.root.remove()
				const newVResultC = new Controller(vish)
				pin.element.after(newVResultC.root)
				pin.lastVResultC = newVResultC
			}
		}

	}
	updateWith(vish) {
		if (vish instanceof VResult) {
			this.updatePins(vish)
		}
		this.vish = vish
	}
}

function oneOf(...things) {
	things = [...things]
	return things[Math.floor(Math.random()*things.length)]
}

let a = 7
let vr = ()=> oneOf(
	v`hi`,
	v`<b>hi</b>`,
	v`<span>wuss ${"uppppp"}</span>`,
	v`<span>wuss ${v`
		<div>upppp heyyyy ${a}</div>
		`
	}</span>`,
	)

let template = ()=> v`
		<div>
			<b>fasad ${a++}</b>
			<i>hi</i> <br>
			${vr()}
		</div>
	`

let controller = new Controller(template())

controller.to(document.body)

setInterval(()=>{
	controller.updateWith(template())
}, 200)
