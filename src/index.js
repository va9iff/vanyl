let unique = ((counter = 0) => () => `V${counter++}`)()

class VResult {
		constructor(strings, ...args) {
			;[this.strings, this.args] = [strings, args]
		}
		get key() {
			return this.args[0].key
		}
	} // to check if typeof vResult

export class Vanyl {
	constructor(vResult) {
		this.vResult = vResult
		let [html, lt, gt, inTag] = ["", 0, 0, () => lt > gt]
		for (let [i, arg] of vResult.args.entries()) {
			let string = vResult.strings[i]
			html += string
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]

			if (inTag()) {
				html += this.initProp()
			} else if (
				!inTag() &&
				Array.isArray(arg) &&
				arg[0] instanceof VResult
			) {
				html += this.initList()
				console.log("vResuluut")
			} else if (!inTag()) {
				html += this.initText()
			}
		}
		this.html = html + this.vResult.strings.at(-1)
		// console.log(html)
	}
	vFun() {
		return v`V~`
	}
	datas = [] // [{handleType:"text", element: div}]
	initProp() {
		let data = { selector: unique(), handleType: "__PROPS__" }
		this.datas.push(data)
		return `${data.selector}`
	}
	initText() {
		let data = { selector: unique(), handleType: "__TEXT__" }
		this.datas.push(data)
		return `<b ${data.selector}>${data.selector}text</b>`
	}
	initList() {
		let data = { selector: unique(), handleType: "__LIST__", vanyls: {} }
		this.datas.push(data)
		return `${data.selector + "list"}<wbr ${data.selector}>`
	}
	updateWith(vResultFresh) {
		for (let [i, data] of this.datas.entries()) {
			let arg = vResultFresh.args[i]
			if (data.handleType == "__TEXT__") 
				data.element.innerHTML = arg
			else if (data.handleType == "__PROPS__") 
				for (let key in arg) data.element[key] = arg[key]
			 else if (data.handleType == "__LIST__") {
				let frag = document.createDocumentFragment()
				for (let vResult of arg) {
					let dataVanyl = data.vanyls[vResult.key] // take vResult in display
					if (dataVanyl) dataVanyl.addTo(frag).updateWith(vResult)
					else {
						let vanylToAdd = new Vanyl(vResult)
						vanylToAdd.grabFirstChild()
						vanylToAdd.addTo(frag)
						data.vanyls[vanylToAdd.vResult.key] = vanylToAdd
						vanylToAdd.updateWith(vResult)
					}
					if (!arg.some(_vResult => _vResult.key == vResult.key))
						data.vanyls[vResult.key].topElement.remove()
				}
				data.element.after(frag)
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
		for (let data of this.datas) {
			data.element = this.topElement.hasAttribute(data.selector) ? this.topElement : this.topElement.querySelector(`[${data.selector}]`)
			if (data.element == null) throw new Error("couldn't find "+data.selector)
		}
	}
	grabFirstChild() {
		this.domik = new DOMParser().parseFromString(this.html, "text/html")
		this.topElement = this.domik.body.firstChild
		this.process()
		// console.log(this.topElement)
	}
	addTo(element) {
		element.appendChild(this.topElement)
		return this
	}
}

export const v = (...argums) => new VResult(...argums) // -> [{strings: [''], args: [any]}]

export const create = vFun => {
	let vanyl = Vanyl.fromVFun(vFun)
	vanyl.grabFirstChild()
	return vanyl
}

export const sync = (vFun, syncElement) => {
	let vanyl = Vanyl.fromVFun(vFun)
	vanyl.topElement = syncElement
	vanyl.topElement.innerHTML = vanyl.html //~
	return vanyl
}
