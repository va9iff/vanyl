// storeds = [arg, currentType, ?oldType][]

function getType(arg) {
	let type = typeof arg
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "function":
		case "undefined":
			return type
			break
		default:
			if (arg === null)
				return "null"
			else if (Array.isArray(arg))
				"array"
			else if (arg instanceof Element)
				return "element"
			else if (type == "object")
				return "object"
			else console.error("unknown type", arg)
	}
}

function storedType(arg, inTag) {
	let type = getType(arg)
	if (inTag)
		switch (type) {
			case "function":
				return "function"
				break
			case "object":
				return "props"
				break
			default: 
				console.error("unexpected type inside of a tag", arg)
		}
	else 
		switch(type) {
			case "string":
			case "number":
				return "text"
				break
			case "element":
			case "array":
				return type
				break
			default: 
				console.error("unexpected type outside of a tag", arg)
	}
}

class V {
	markedHTML = ""
	storeds = []
	constructor(strings, ...args){
		let lt = 0, 
			gt = 0
		this.strings = strings
		for (const [i, arg] of args.entries()) {
			const string = strings[i]
			this.markedHTML += string
			gt += string.split(">").length
			lt += string.split("<").length

			let inTag = lt > gt
			let type = storedType(arg, inTag)
			let stored = { arg, type }

			switch (stored.type){
				case "function":
				case "props":
					this.markedHTML += `i${this.storeds.push(stored)}`
					break
				case "text":
				case "element":
				case "array":
					this.markedHTML += `<wbr i${this.storeds.push(stored)}>`
					break
				default:
					console.error("unknown stored type", stored)
			}
			this.markedHTML += strings.at(-1)
		}
	}
	markHTML(){
		
	}

			// if (inTag) 
			// 	switch (type) {
			// 		case "function":
			// 			console.log('fasad')
			// 			this.markedHTML += `i${this.storeds.push([arg, "function"])}`
			// 			break
			// 		case "object":
			// 			this.markedHTML += `i${this.storeds.push([arg, "props"])}`
			// 			break
			// 		default: 
			// 			console.error("unexpected type inside of a tag", arg)
			// 	}
			// else 
			// 	switch(type) {
			// 		case "string":
			// 		case "number":
			// 			this.markedHTML += `<wbr i${this.storeds.push([arg, "text"])}>`
			// 			break
			// 		case "element":
			// 			this.markedHTML += `<wbr i${this.storeds.push([arg, "element"])}>`
			// 			break
			// 		case "array":
			// 			this.markedHTML += `<wbr i${this.storeds.push([arg, "array"])}>`
			// 			break
			// 		default: 
			// 			console.error("unexpected type outside of a tag", arg)

			// }

	updateWith(vResult){}
		/*for (let i = 0; i < this.storeds.length; i++) {
			let el = holder.querySelector(`[i${i + 1}]`)
			const stored = this.storeds[i][0]
			switch (this.storeds[i][1]) {
				case "function":
					stored(el)
					break
				case "element":
				case "text":
					el.replaceWith(stored)
					break
				case "array":
					for (const _el of stored) el.before(_el)
					el.remove()
					break
				case "props":
					for (let key in stored) el[key] = stored[key]
			}
		}

		const child = holder.firstElementChild
		child.remove()
		return child*/

}

export function v () {
	return new V(...arguments)
}

let vr = v`<div>hi ${"guys"}<button ${{onclick: e=>alert()}}>bum</button></div>`
console.log(vr.markedHTML)
console.log(...vr.storeds)

let disabler = ()=> {
	/*export*/ class VResult {
		constructor(strings, ...args) {
			this.strings = strings
			this.args = args
		}
		isSame(_vResult) {
			if (!_vResult) return false
			if (! (_vResult instanceof VResult)) return false
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
		lastVResultC = null
		lastList =  [/*controller*/]
		last = ""
	}

	/*export*/ function v() {
		return new VResult(...arguments)
	}

	/*export*/ function markHtml(vish) {
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

	/*export*/ function processHtml(parent, pins) {
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

	/*export*/ function firstChildWithProcessedPins(vish) {
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
			let now
			if (typeof vish == "string" || typeof vish == "number") {
				now = "text"
				pin.element.nodeValue = vish
			} else if (pin.last == "text") {
				pin.element.nodeValue = ""
			}

			if (vish instanceof VResult){
				now = "vResult"
				if (vish.isSame(pin.lastVResultC?.vish)){
					pin.lastVResultC.updateWith(vish)
				} else {
					pin.lastVResultC?.root.remove()
					const newVResultC = new Controller(vish)
					pin.element.after(newVResultC.root)
					pin.lastVResultC = newVResultC
				}
			} else if (pin.last == "vResult") {
				pin.lastVResultC?.root.remove()
				pin.lastVResultC = null
			}
			pin.last = now

		}
		updateWith(vish) {
			if (vish instanceof VResult) {
				this.updatePins(vish)
			}
			/* else if (typeof vish == "string" || typeof vish == "number"){
				[insert returning to a string from template function logic here]
				or maybe not. unnecessary complications
			}*/
			this.vish = vish
		}
	}

	function oneOf(...things) {
		things = [...things]
		return things[Math.floor(Math.random()*things.length)]
	}

	let a = 7
	let vr = ()=> oneOf(
		"hi",
		// v`hi`,
		// v`<b>hi</b>`,
		// v`<span>wuss ${"uppppp"}</span>`,
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
	}, 700)
}