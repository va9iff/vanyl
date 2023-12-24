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
			else if (arg instanceof V)
				return "v"
			else if (arg instanceof Element)
				return "element"
			else if (type == "object")
				return "object"
			else console.error("unknown type", arg)
	}
}

function storedType(arg, inTag) {
	if (inTag == undefined) console.error("storetType needs to know if the element is in a tag (second argument: boolean)")
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
			case "v":
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
			case "v":
				html += `<wbr i${i}>`
				break
			default:
				console.error("unknown stored type", stored)
		}
	}
	html += strings.at(-1)
	return [html, storeds]
}

class V {
	markedHTML = ""
	storeds = []
	root = null
	args = []
	constructor(strings, args){
		this.strings = strings
		this.args = args
	}

	// should be called only if this.isSame(vResult) or gives unexpected results
	updateWith(vResult){
		for (let [i, stored] of this.storeds.entries()){
			let arg = vResult.args[i]
			stored.type = storedType(arg, stored.inTag)

			console.log(stored.type)

			// if the type changes, we should clean the previous things.
			if (stored.type != stored.oldType){
				// stored.oldArg is old arg
				switch (stored.oldType) {
					case "array":
						// remove all the previous elements
					break
				}

				// at the end, everything should end such that stored.element is 
				// an element-like to use as a mark to replace the new thing

				// also the new type may require initial setup, se here's a good place
				switch (stored.type){
					case "text":
						let newTextNode = document.createTextNode(arg)
						stored.element.replaceWith(newTextNode)
						stored.element = newTextNode
						break
					case "v":
						arg.parse()
						stored.element.replaceWith(arg.root)
						stored.element = arg.root
						stored.v = arg

				}
			}

			// if the type is the same, we can update it way more simpler
			else if (stored.type == stored.oldType){
				switch (stored.type){
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
					case "v":
						stored.v.updateWith(arg)
				}
			}

			// there's some others that doesn't care about the oldType
			// and they'll do the exact same thing every time.
			switch (stored.type) {
				case "function":
					if (!stored.wasOneTimeCall) 
						stored.wasOneTimeCall = arg(stored.element) != "repeat"
					break
				case "props":
					for (let key in arg)
						stored.element[key] = arg[key]
					break
				case "element":
					stored.element.replaceWith(arg)
					break
				case "text":
					stored.element.nodeValue = arg
					break

				case "v":
				case "array":
					break // so it won't hit the error
				default:
					console.error("unknown stored type", stored)

			}
			stored.oldArg = arg
			stored.oldType = stored.type
		}
	}
	parse(){
		;[ this.markedHTML, this.storeds ] = markHtml(this)

		const holder = document.createElement('div')
		holder.innerHTML = this.markedHTML
		for (let [i, stored] of this.storeds.entries()) {
			stored.element = holder.querySelector(`[i${i}]`)
		}
		const child = holder.firstElementChild
		child.remove()
		this.root = child
		this.updateWith(this) // ~~~ I feel like it shouldn't be there tho.
		// or let it there. I'd change completely if it should have been another place.
		// there's a `div` is being in use and it's generally a bit shitty in that manner.
		// so the VanylElement will have completely different approach on top level parse.
		// but this can be the vResult arg method toc reate the element.

		// so .parse() always does update. it's like marks, processes, updates 
		// and gives you the element. you can even udate the vResult afterwards.
		return child
	}
}

export function v (strings, ...args) {
	return new V(strings, args)
}

const oneOf = (...args) => args[Math.floor(Math.random()*args.length)]


let ab = ()=>oneOf("a", v`<i>that's a ${Math.random()} vResult</i>`)

let fun = ()=>v`<div>hi <b>${ab()}</b></div>`
let vr = fun()
let child = vr.parse()
vr.updateWith(fun())
document.body.appendChild(child)

setInterval(function() {
	vr.updateWith(fun())
}, 800);

