export const unique = ((counter = 0) => () => `V${counter++}`)()

const should = new (class Sould {
	sameVResult(vResult1, vResult2) {
		if (!vResult1.isSame(vResult2)) throw new Error(`should be same vResult ~V`)
	}
	notNull(val) {
		if (val == null) throw new Error("should not be null ~V")
	}
	instanceof(instance, cls) {
		if (!(instance instanceof cls))
			throw new Error(`expected an instance of ${cls.name} ~V`)
	}
})()

class VResult {
	constructor(strings, ...args) {
		;[this.strings, this.args] = [strings, args]
	}
	get key() {
		return this.args[0].key
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

export const ref = () => {
	const fun = () => fun.element ?? null
	return fun
}

// WE MAY NOT NEED __TEXT__ __PROPS__ __LIST__
// JUST USE A LOGIC TO SWAP BETWEEN
// obviously props will be different as it's in tag

// each data will have 'element' prop to know the location in the dom (with wbr)
// @process
// if intag: data = {element: element, now: props} // `now` will also assigned to `remembers`

//
// if arg is array: data.now=arg
// elif arg instanceof VResult: data.now = "__VRESULT__"
// else data.now = "text"
//
// if data.remembers == data.now:
//

// __VRESULT__ __LIST__ __TEXT__

// idk maybe use switch's not breaking cases

// NO NO NO THIS ALL 3 IS 1!! 
// IN PROCESS, TAKE THE WBR AND CONVERT IT TO A TEXT NODE IN ALL 3.
// USE THIS TEXT NODE TO USE `.after` FOR LISTS AND VRESULTS
// USE THIS ITSELF FOR _TEXT_
// WE DON'T HAVE TO SPLIT THEM.
// if arg is array of vResults:
// do the same thing. we got element, we got arg, just add few arrays in data object. not a problem.

// so, initing a data will be same for all none-in-tag datas.
// switch statement will be replaced with the conditionals in the init.
// it will give the flexibility to switch args from list to single vResult to string.
// they all need the same stuff to work.


export class Vanyl {
	constructor(vResult = v`<b>empty v</b>`) {
		this.vResult = vResult
		this.html = this.initHTML(vResult)
		this.topElement = this.grabFirstChild(this.html)
		this.process()
		this.updateWith(vResult)
	}
	vFun() {
		return v`V~${this.constructor.name}`
	}
	datas = []
	initHTML(vResult) {
		let [html, lt, gt, data] = ["", 0, 0, null]
		for (const [i, arg] of vResult.args.entries()) {
			const string = vResult.strings[i]
			html += string
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
			const inTag = lt > gt
			if (inTag) {
				data = {
					handleType: "__PROPS__",
					_PROPS_: true,
					selector: unique(),
				}
				html += ` ${data.selector} `
			} else if (arg instanceof VResult && vResult.isSame(vResult)) {
				data = {
					handleType: "__VRESULT__",
					selector: unique(),
					vanyl: new Vanyl(v`<wbr>`),
					vanyls: [],
				}
				html += `${data.selector + "vresult:"}<wbr ${data.selector}>`
			} else if (!inTag && Array.isArray(arg) && arg[0] instanceof VResult) {
				data = {
					handleType: "__LIST__",
					selector: unique(),
					vanyls: {},
					vanylsKeyless: [],
				}
				html += `<wbr ${data.selector}>`
			} else if (!inTag) {
				data = {
					handleType: "__TEXT__",
					selector: unique(),
				}
				html += `<b ${data.selector}>${data.selector}text</b>`
			} else {
				throw new Error("?? ~V")
			}
			data.i = i
			this.datas.push(data)
		}
		html += vResult.strings.at(-1)
		return html
	}
	updateWith(vResultFresh) {
		should.sameVResult(this.vResult, vResultFresh)
		this.vResult = vResultFresh
		for (const [i, data] of this.datas.entries()) {
			const arg = vResultFresh.args[i]
			switch (data.handleType) {

				case "__PROPS__": // arg is dynamic props object
					for (const [key, val] of Object.entries(arg)) {
						const $key = key.slice(1)
						if (val instanceof Lazy || key == "ref") "just stop"
						else if (key[0] == ".")
							if (val) data.element.classList.add($key)
							else data.element.classList.remove($key)
						else data.element[key] = val
					}
					break

				case "__VRESULT__": // arg is a vResult
					const vResult = /*VResult.ish*/(arg)
					if (data.vanyl.vResult.isSame(vResult)) data.vanyl.updateWith(vResult)
					else {
						data.vanyl.topElement.remove() // changed from ?.remove() as we use {vanyl: new Vanyl(v``)}
						data.vanyl = data.vanyls.find(vanyl => vanyl.vResult.isSame(vResult))
						if (!data.vanyl) {
							data.vanyl =
								vResult instanceof VResult
									? new Vanyl(vResult)
									: new Vanyl(v`${vResult}`)
							data.vanyls.push(data.vanyl)
						}
						data.element.after(data.vanyl.topElement)
					}
				case "__TEXT__": // arg is the dynamic text
					data.element.nodeValue = arg
					break

				case "__LIST__": // arg is the array of vResults
					const frag = document.createDocumentFragment()
					while (data.vanylsKeyless.length > 0)
						data.vanylsKeyless.pop().topElement.remove()

					// (once a vanyl with a key was added it'll check every time to remove)
					for (const dataVanylKey in data.vanyls)
						if (!arg.some(_vResult => dataVanylKey == _vResult.key))
							data.vanyls[dataVanylKey].topElement.remove()

					for (let vResult of arg) {
						vResult = /*VResult.ish*/(vResult)
						let vanyl = data.vanyls[vResult.key] // take vResult in display
						if (vanyl) {
							vanyl.updateWith(vResult)
						} else if (vResult.key) {
							vanyl = new Vanyl(vResult)
							data.vanyls[vanyl.vResult.key] = vanyl
						} else {
							vanyl = new Vanyl(vResult)
							data.vanylsKeyless.push(vanyl)
						}
						frag.appendChild(vanyl.topElement)
					}
					data.element.after(frag)
					break
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
	process() {
		for (const data of this.datas) {
			data.element = this.topElement.hasAttribute(data.selector)
				? this.topElement
				: this.topElement.querySelector(`[${data.selector}]`)
			should.notNull(data.element)
			 if (data._PROPS_) {
				for (const [key, val] of Object.entries(this.vResult.args[data.i])) {
					const $key = key.slice(1)
					if (key[0] == "@") {
						data.element.addEventListener($key, val)
					} else if (key == "ref") {
						val.element = data.element
					} else if (val instanceof Lazy) {
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
		const topElement = domik.body.firstChild
		should.notNull(topElement)
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
