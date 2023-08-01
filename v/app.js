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
				return "array"
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

function markHtml(vResult) {
	const { args, strings } = vResult

	let lt = 0, 
		gt = 0,
		html = "",
		inTag = false,
		storeds = []

	for (const [i, arg] of args.entries()) {
		const string = strings[i]
		html += string

		gt += string.split(">").length
		lt += string.split("<").length
		inTag = lt > gt

		let type = storedType(arg, inTag)
		let stored = { arg, type, inTag }
		storeds.push(stored)

		switch (stored.type){
			case "function":
			case "props":
				html += `i${i}`
				break
			case "text":
			case "element":
			case "array":
				html += `<wbr i${i}>`
				break
			default:
				console.error("unknown stored type", stored)
		}
	}
	html += strings.at(-1)
	return [html, storeds]
}

function getFirstChild(htmlString){
	const holder = document.createElement('div')
	holder.innerHTML = htmlString
	const child = holder.firstElementChild
	child.remove()
	return child
}

// function parseThatAlsoUpdates(htmlString, storeds) {
// 	const holder = document.createElement('div')
// 	holder.innerHTML = htmlString

// 	for (let [i, stored] of storeds.entries()) {
// 		const { arg } = stored
// 		let el = holder.querySelector(`[i${i}]`)
// 		switch (stored.type) {
// 			case "function":
// 				stored.arg(el)
// 				break
// 			case "element":
// 			case "text":
// 				el.replaceWith(stored.arg)
// 				break
// 			case "array":
// 				for (const _el of stored.arg) el.before(_el)
// 				el.remove()
// 				break
// 			case "props":
// 				console.log(holder.firstElementChild)
// 				for (let key in stored.arg) el[key] = stored.arg[key]
// 		}
// 	}
// 	const child = holder.firstElementChild
// 	child.remove()
// 	return child
// }

function parse(htmlString, storeds) {
	const holder = document.createElement('div')
	holder.innerHTML = htmlString

	for (let [i, stored] of storeds.entries())
		stored.element = holder.querySelector(`[i${i}]`)

	const child = holder.firstElementChild
	child.remove()
	return child
}

function getFirstChildParsed(argument) {
	const holder = document.createElement('div')
	holder.innerHTML = htmlString
	const child = holder.firstElementChild
	child.remove()
	return child
}

class V {
	markedHTML = ""
	storeds = []
	root = null
	args = []
	constructor(strings, args){
		this.strings = strings
		this.args = args

		// let [ htmlString, storeds ] = markHtml(this)
		// ;[ this.markedHTML, this.storeds ] = markHtml(this)

		// this.updateWith(this) // we should parse and querySelector
		// console.log(this.markedHTML)
		// console.log(this.storeds)
	}

	// should be called only if this.isSame(vResult)
	updateWith(vResult){
		for (let [i, stored] of this.storeds.entries()){
			let arg = vResult.args[i]
			// switch (stored.type){
			// 	case "text":
			// 		stored.element.nodeValue = ""
			// 		break
			// }
			// stored.type = storedType(arg, stored.inTag)
			switch (stored.oldType){

			}

			switch (stored.type){
				case "function":
					console.log('hit the funs')
					if (!stored.wasOneTimeCall) arg(stored.element)
					break
				case "text":
					if (stored.type != stored.oldType) {
						let newTextNode = document.createTextNode(arg)
						stored.element.replaceWith(newTextNode)
						stored.element = newTextNode
					} else
						stored.element.nodeValue = arg
					break
				case "element":
					// console.log('hit the elem', arg)
					stored.element.replaceWith(arg)
					break
				case "array":
					/* 
						for (oldVr of oldArr) 
							exists = newArr.find(newVr => oldVr.isSame(newVr))
							if (exists) 
								// !! it'll keep replacing the first occurance
								oldVr.updateWith(exists)
							else
								oldVr.remove()
					*/
					break
				case "props":
					for (let key in arg)
						stored.element[key] = arg[key]
					break
				default:
					console.error("unknown stored type", stored)
			}
			stored.arg = arg
		}
	}
	parse(){
		;[ this.markedHTML, this.storeds ] = markHtml(this)



		const holder = document.createElement('div')
		holder.innerHTML = markHtml(this)
		for (let [i, stored] of this.storeds.entries()) {
			stored.element = holder.querySelector(`[i${i}]`)

		}
		const child = holder.firstElementChild
		child.remove()
		this.root = child
		return child
	}


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

export function v (strings, ...args) {
	return new V(strings, args)
}

const oneOf = (...args) => args[Math.floor(Math.random()*args.length)]


let ab = ()=>(Math.random()>0.5?"a":"b") + Math.random()

let fun = ()=>v`<div>hi <b>${ab()}</b></div>`
let vr = fun()
let child = vr.parse()
vr.updateWith(fun())
document.body.appendChild(child)

setInterval(function() {
	vr.updateWith(fun())
}, 800);

