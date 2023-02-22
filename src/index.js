export const unique = ((counter = 0) => () => `V${counter++}`)()

class VError extends Error {
	name = "VanylError"
}
class TypeVError extends TypeError {
	name = "VanylTypeError"
}

const expect = {
	vResult(arg) {
		if (!(arg instanceof VResult))
			throw new TypeVError("expected vResult. \n instead use v`` function.")
	},
	sameVResult(vResult1, vResult2) {
		if (!vResult1.isSame(vResult2)) throw new VError("expected same vResult")
	},
	notNull(val) {
		if (val == null) throw new VError("not expected null")
	},
	oneChildElementCount(element) {
		if (element.childElementCount != 1)
			throw new VError(
				`expected 1 wrapped top element (got ${
					element.childElementCount
				}): \n${element.innerHTML.slice(0, 30)}...`
			)
	},
	notNullish(val) {
		if (val == null || val == undefined)
			throw new VError("not expected nullish")
	},
	instanceof(instance, cls) {
		if (!(instance instanceof cls))
			throw new TypeVError(`expected an instance of ${cls.name || cls}`)
	},
	vResultAt(arg, i) {
		if (!(arg instanceof VResult))
			throw new VError(`expected vResult for argument ${i} but got ${arg}`)
	},
}

class VResult {
	constructor(strings, ...args) {
		;[this.strings, this.args] = [strings, args]
	}
	get key() {
		return this.args?.[0]?.key
	}
	get keep() {
		return this.args[0].keep
	}
	isSame(_vResult) {
		return (
			this.strings.length == _vResult.strings.length &&
			this.strings.every((s, i) => this.strings[i] == _vResult.strings[i])
		)
	}
	isSameish(_vResult) {
		return _vResult instanceof this.constructor && this.isSame(_vResult)
	}
	static ish(arg) {
		return arg instanceof VResult ? arg : v`${arg}`
	}
}
export const v = (...argums) => new VResult(...argums)

export class Lazy {
	constructor(initialValue) {
		this.initialValue = initialValue
	}
	get now() {
		if (this.element) return this.element[this.prop]
		return this.initialValue
	}
	set now(newValue) {
		this.element[this.prop] = newValue
	}
}

export const ref = (fun = () => fun.element ?? null) => fun

/*
	LIST STILL CAN ONLY ACCAPET ARRAY OF vResult
	tbh I don't think we should modify this.
	or maybe use array of text nodes.
	OR MAYBE WE DON'T HAVE TO WRAP EVERYTHING TO 1 ELEMENT
	IT CAN BE textNode AND QUERYING WILL BE FROM PARENT CHILD
	well, technically we won't have multiple elements.
	it just lets us to use something like v`hola`

	wrapping all to 1 element is nice and is the the core thing that made this so vanilla.
	we need to give a proper error to use v`` wrapped 1 html element.

	but really using this.topElement.parentNode.querySelector(data.selector)
	may be a good idea to be able to use v`` as a text node. but I don't know
	if it worth to do it only for this little stuff. and can we use <wbr/> in a
	text node? 

	probably won't change it. may only add a few cleanings and optimizations.
*/

export class Vanyl {
	constructor(vResult = v`<b>empty v</b>`) {
		this.html = this.initHTML(vResult)
		this.topElement = this.grabFirstChild(this.html)

		this.vResult = vResult
		this.process(vResult)

		this.updateWith(vResult)
	}
	vFun() {
		return v`V~${this.constructor.name}`
	}
	datas = []
	initHTML(vResult) {
		let [html, lt, gt] = ["", 0, 0]
		for (const [i, arg] of vResult.args.entries()) {
			const string = vResult.strings[i]
			html += string
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
			const data = { selector: unique(), inTag: lt > gt, i }
			if (data.inTag) html += ` ${data.selector} `
			else html += ` <wbr ${data.selector}> `
			this.datas.push(data)
		}
		html += vResult.strings.at(-1)
		return html
	}
	updateWith(vResultFresh) {
		expect.sameVResult(this.vResult, vResultFresh)
		this.vResult = vResultFresh
		for (const data of this.datas) {
			const arg = vResultFresh.args[data.i]

			if (data.inTag) {
				for (const [key, val] of Object.entries(arg)) {
					const $key = key.slice(1)
					if (val instanceof Lazy || key == "ref") "just stop"
					else if (key[0] == ".")
						if (val) data.element.classList.add($key)
						else data.element.classList.remove($key)
					else data.element[key] = val
				}
				continue
			}

			// if rendered List at least once and also the last time,
			if (data._LIST_?.last) {
				// remove all the keyless from last update
				while (data._LIST_.vanylsKeyless.length > 0)
					data._LIST_.vanylsKeyless.pop().topElement.remove()
				// remove last displaying keyed vanyls if arg doesn't have them
				for (const dataVanyl of data._LIST_.vanylsWithKey) {
					if (!arg.some?.(_vResult => dataVanyl.vResult.key == _vResult.key))
						data._LIST_.vanyls[dataVanyl.vResult.key].topElement.remove()
				}
				data._LIST_.last = false
				// data._LIST_.vanylsKeyless = [] // this will be [] with .pop()
				data._LIST_.vanylsWithKey = []
			}

			if (arg instanceof VResult) {
				// oh my... data._VRESULT_. hurts my eyes
				data.element.nodeValue &&= "" // clear if there's any
				data._VRESULT_ ??= { vanyls: [] }
				if (data._VRESULT_.last?.vResult.isSame(arg))
					data._VRESULT_.last.updateWith(arg)
				else {
					data._VRESULT_.last?.topElement.remove()
					data._VRESULT_.last = data._VRESULT_.vanyls.find(vanyl =>
						vanyl.vResult.isSame(arg)
					)
					if (!data._VRESULT_.last) {
						data._VRESULT_.last = new Vanyl(arg)
						data._VRESULT_.vanyls.push(data._VRESULT_.last)
					}
					data.element.after(data._VRESULT_.last.topElement)
				}
				continue
			} else if (data._VRESULT_?.last) {
				data._VRESULT_.last.topElement.remove()
				data._VRESULT_.last = null
			}

			if (Array.isArray(arg)) {
				data.element.nodeValue &&= "" // clear if there's any

				data._LIST_ ??= {
					// this stores all the keyed vanyls in its keys.
					// so that we can bring them back instead of recreating
					vanyls: {},
					// those 2 contains showing vanyls from last array update.
					vanylsKeyless: [],
					vanylsWithKey: [],
					// if the last call wasn't an array update, don't check for
					// removes as there's no added vanyls since last remove.
					last: true,
				}
				const frag = document.createDocumentFragment()

				for (let vResult of arg) {
					let vanyl = data._LIST_.vanyls[vResult.key] // take vResult in display
					if (vanyl) {
						// can raise when array gets non-same vResults with same keys
						vanyl.updateWith(vResult)
						data._LIST_.vanylsWithKey.push(vanyl)
					} else if (vResult.key) {
						vanyl = new Vanyl(vResult)
						data._LIST_.vanyls[vanyl.vResult.key] = vanyl
						data._LIST_.vanylsWithKey.push(vanyl)
					} else {
						vanyl = new Vanyl(vResult)
						data._LIST_.vanylsKeyless.push(vanyl)
					}
					frag.appendChild(vanyl.topElement)
				}
				data.element.after(frag)
				data._LIST_.last = true
			} else {
				// arg is whatever, assign as dynamic text
				data.element.nodeValue = arg
				continue
			}
		}
		return this
	}
	update() {
		return this.updateWith(this.vFun())
	}
	static fromVFun(vFun) {
		const vanyl = new Vanyl(vFun())
		vanyl.vFun = vFun
		return vanyl
	}
	process(vResult) {
		for (const data of this.datas) {
			data.element = this.topElement.hasAttribute(data.selector)
				? this.topElement
				: this.topElement.querySelector(`[${data.selector}]`)
			expect.notNull(data.element) // can be textnode if v`` isn't wrapped in a tag
			data.element.removeAttribute(data.selector)
			if (data.inTag) {
				for (const [key, val] of Object.entries(vResult.args[data.i])) {
					const $key = key.slice(1)
					if (key[0] == "@") data.element.addEventListener($key, val)
					else if (key == "ref") val.element = data.element
					else if (val instanceof Lazy) {
						val.element = data.element
						val.prop = key
						val.element[val.prop] = val.initialValue
					}
				}
			} else {
				const textNode = document.createTextNode(data.selector)
				data.element.replaceWith(textNode)
				data.element = textNode
			}
		}
	}
	grabFirstChild(htmlString) {
		const domik = new DOMParser().parseFromString(htmlString, "text/html")

		expect.oneChildElementCount(domik.body)
		const topElement = domik.body.children[0]
		// console.log(topElement)
		expect.notNull(topElement) // !this can be text ndoe if no tag was provided
		// !won't be a text node. children only includes elements.
		// also won't be null ever. as we check to have one child element. no more, no less.
		return topElement
	}
}

export class vanyl extends Vanyl {
	constructor(vFun) {
		const vResult = vFun()
		super(vResult)
		this.vFun = vFun
	}
}

export const create = vFun => Vanyl.fromVFun(vFun)
