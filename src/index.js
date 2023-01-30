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
		let [html, lt, gt] = ["", 0, 0]
		for (const [i, arg] of vResult.args.entries()) {
			const string = vResult.strings[i]
			html += string
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
			const data = { selector: unique(), inTag: lt > gt }
			if (data.inTag) html += ` ${data.selector} `
			else html += ` <wbr ${data.selector}> `
			
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

				/* this won't alter as you can't go to outside of a tag and inside, there's only _PROPS_*/
				// we don't need a _PROPS_ namespace, dynamic props don't store anything.
				// if this argument is in tag, just do the _PROP_ thing.
				if (data.inTag){ // arg is dynamic props object
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

				/* this 3 can alter tho. once arg is list, then string */
				if (arg instanceof VResult){ // arg is a vResult
					data._VRESULT_ ??= {
						// vanyl: new Vanyl(v`<wbr>`),
						vanyls: [],
					}
					if (data._VRESULT_.vanyl?.vResult.isSame(arg)) data._VRESULT_.vanyl.updateWith(arg)
					else {
						data._VRESULT_.vanyl?.topElement.remove()
						data._VRESULT_.vanyl = data._VRESULT_.vanyls.find(vanyl => vanyl.vResult.isSame(arg))
						if (!data._VRESULT_.vanyl) {
							data._VRESULT_.vanyl = new Vanyl(arg)
							data._VRESULT_.vanyls.push(data._VRESULT_.vanyl)
						}
						data.element.after(data._VRESULT_.vanyl.topElement)
					}
					continue
				} else if (data._VRESULT_?.vanyl){
					data._VRESULT_.vanyl.topElement.remove()
					data._VRESULT_.vanyl = null
				}
				
				if (Array.isArray(arg)){ // arg is the array of vResults
					data._LIST_ ??=	{
						vanyls: {},
						vanylsKeyless: [],
					}
					const frag = document.createDocumentFragment()
					while (data._LIST_.vanylsKeyless.length > 0)
						data._LIST_.vanylsKeyless.pop().topElement.remove()

					// (once a vanyl with a key was added it'll check every time to remove)
					for (const dataVanylKey in data._LIST_.vanyls)
						if (!arg.some(_vResult => dataVanylKey == _vResult.key))
							data._LIST_.vanyls[dataVanylKey].topElement.remove()

					for (let vResult of arg) {
						vResult = /*VResult.ish*/(vResult)
						let vanyl = data._LIST_.vanyls[vResult.key] // take vResult in display
						if (vanyl) {
							vanyl.updateWith(vResult)
						} else if (vResult.key) {
							vanyl = new Vanyl(vResult)
							data._LIST_.vanyls[vanyl.vResult.key] = vanyl
						} else {
							vanyl = new Vanyl(vResult)
							data._LIST_.vanylsKeyless.push(vanyl)
						}
						frag.appendChild(vanyl.topElement)
					}
					data.element.after(frag)
					}
					else { // arg is whatever, assign as dynamic text
					data.element.nodeValue = arg
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
			console.log(this.topElement.hasAttribute('.'))
			data.element = this.topElement.hasAttribute(data.selector)
				? this.topElement
				: this.topElement.querySelector(`[${data.selector}]`)
			should.notNull(data.element)
			 if (data.inTag) {
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
		// console.log(topElement)
		should.notNull(topElement) // !this can be text ndoe if no tag was provided
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
