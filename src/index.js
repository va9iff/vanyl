export let unique = ((counter = 0) => () => `V${counter++}`)()

let should = {
	sameVResult(vResult1, vResult2) {
		if (!vResult1.isSame(vResult2)) throw new Error(`should be same vResult`)
	},
	notNull(val) {
		if (val == null) throw new Error("couldn't find " + data.selector)
	},
}

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
}

/* isn't implemented yet */
/* we have to implement:
	@eventListener // done
	.className // done
	~lazy // done
	keyless list

	(classnames being in quote ".className" is okay but I don't want event
	types to be wrapped in quotes "@click". finding something better would be great.
	if could do something like { click(e){} } and know that it wasn't a property.
	different than { click: function(e){} } but { "@click": function(e){} } stays)
*/

/* 	MAYBE WE DON'T NEED "~" PREFIX FOR LAZY
	WHEN A VALUE OF A PROPERTY IS LAZY, LIKE:
	let text = new Lazy("")
	${{value: text}}
	THEN WE CAN JUST USE THE VALUE STRING.
  */
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
	let result = function() {
		return result.element ?? null
	}
	return result
}

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
	initHTML(vResult) {
		let [html, lt, gt] = ["", 0, 0]
		for (let [i, arg] of vResult.args.entries()) {
			let string = vResult.strings[i]
			html += string
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
			let inTag = lt > gt

			if (inTag) {
				html += this.initProp()
			} else if (arg instanceof VResult && vResult.isSame(vResult)) {
				html += this.initVResult()
			} else if (!inTag && Array.isArray(arg) && arg[0] instanceof VResult) {
				html += this.initList()
			} else if (!inTag) {
				html += this.initText()
			}
		}
		html += vResult.strings.at(-1)
		return html
	}
	datas = [] // [{handleType:"text", element: div}]
	initProp() {
		let data = { selector: unique(), handleType: "__PROPS__" }
		this.datas.push(data)
		return ` ${data.selector} ` // fixing v`<li${{key:some}}></li>` bug
	}
	initText() {
		let data = { selector: unique(), handleType: "__TEXT__" }
		this.datas.push(data)
		return `<b ${data.selector}>${data.selector}text</b>`
	}
	initList() {
		let data = { selector: unique(), handleType: "__LIST__", vanyls: {}, keylessVanyls: [] }
		this.datas.push(data)
		return `<wbr ${data.selector}>`
	}
	initVResult() {
		let data = {
			selector: unique(),
			handleType: "__VRESULT__",
			vanyl: new Vanyl(v``),
		}
		this.datas.push(data)
		return `${data.selector + "vresult:"}<wbr ${data.selector}>`
	}
	updateWith(vResultFresh) {
		should.sameVResult(this.vResult, vResultFresh)
		this.vResult = vResultFresh
		for (let [i, data] of this.datas.entries()) {
			let arg = vResultFresh.args[i]
			switch (data.handleType) {

				case "__LIST__": // arg is the array of vResults
					let frag = document.createDocumentFragment()
					data.keylessVanyls.forEach(vanyl=>vanyl.topElement.remove())

					for (let vResult of arg) {
						let dataVanyl = data.vanyls[vResult.key] // take vResult in display
						if (dataVanyl) {
							if (vResult.key && !vResult.keep) frag.appendChild(dataVanyl.topElement)
							dataVanyl.updateWith(vResult) // I want it synchronous. so, we do a way around (look up)
						} else if(vResult.key) {
							let vanylToAdd = new Vanyl(vResult)
							frag.appendChild(vanylToAdd.topElement)
							data.vanyls[vanylToAdd.vResult.key] = vanylToAdd
						} else{
							let vanylToAddKeyless = new Vanyl(vResult)
							frag.appendChild(vanylToAddKeyless.topElement)
							data.keylessVanyls.push(vanylToAddKeyless)
						}
						// remove old data vanyl that's not in arg. (identified with key)
						// (once a vanyl was added it'll every time check to remove)
						for (let vanyl of Object.values(data.vanyls))
							if (!arg.some(vr => vanyl.vResult.key == vr.key))
								vanyl.topElement.remove()
					}
					data.element.after(frag)
					break

				case "__TEXT__": // arg is the dynamic text
					data.element.nodeValue = arg
					break

				case "__PROPS__": // arg is dynamic props object
					for (let [key, val] of Object.entries(arg)) {
						let $key = key.slice(1)
						if (key[0] == ".")
							if (val) data.element.classList.add($key)
							else data.element.classList.remove($key)
					}
					break

				case "__VRESULT__": // arg is a vResult
					if (data.vanyl.vResult.isSame(arg)) data.vanyl.updateWith(arg)
					else {
						data.vanyl.topElement?.remove()
						data.vanyl = new Vanyl(arg)
						data.element.after(data.vanyl.topElement)
					}
					break
			}
		}
		return this
	}
	update() {
		return this.updateWith(this.vFun())
	}
	static fromVFun(vFun) {
		let vanyl = new Vanyl(vFun())
		vanyl.vFun = vFun
		return vanyl
	}
	process() {
		for (let [i, data] of this.datas.entries()) {
			data.element = this.topElement.hasAttribute(data.selector)
				? this.topElement
				: this.topElement.querySelector(`[${data.selector}]`)
			should.notNull(data.element)
			if (data.handleType == "__TEXT__") {
				let textNode = document.createTextNode(data.selector)
				data.element.replaceWith(textNode)
				data.element = textNode
			}
			else if (data.handleType == "__PROPS__") {
				for (let [key, val] of Object.entries(this.vResult.args[i])){
					let $key = key.slice(1)
					if (key[0]=='@'){
						data.element.addEventListener($key, val)
					}
					else if (key=='ref'){
						val.element = data.element
					}
					else if(val instanceof Lazy){
						val.element = data.element
						val.prop = key
						val.element[val.prop] = val.initialValue
					}
				}
			}
		}
	}
	grabFirstChild(htmlString) {
		this.domik = new DOMParser().parseFromString(htmlString, "text/html")
		let topElement = this.domik.body.firstChild
		return topElement
	}
}

export const v = (...argums) => new VResult(...argums)

export class vanyl extends Vanyl {
	constructor(vFun) {
		let vResult = vFun()
		super(vResult)
		this.vFun = vFun
	}
}

export const create = vFun => {
	let vanyl = Vanyl.fromVFun(vFun)
	//!1 vanyl.grabFirstChild()
	return vanyl
}


console.log(new Vanyl().initHTML(v`<b ${{color: "red"}}>that's ${"dynamo"} part</b>`))