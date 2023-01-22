export let unique = ((counter = 0) => () => `V${counter++}`)()

class VResult {
		constructor(strings, ...args) {
			;[this.strings, this.args] = [strings, args]
		}
		get key() {
			return this.args[0].key
		}
		isSame(_vResult){
			return this.strings.length == _vResult.strings.length && this.strings.every((s,i)=>this.strings[i]==_vResult.strings[i])
		}
	}

export class Vanyl {
	constructor(vResult) {
		this.vResult = vResult
		this.html = this.initHTML()
		this.topElement = this.grabFirstChild() //1: Vanyls can have only 1 top 
		// but it's okay cuz now we can have full working Vanyl just after construct
		this.process()
		this.updateWith(vResult)
	}
	vFun() {
		return v`V~${this.constructor.name}`
	}
	initHTML(){
		let [html, lt, gt, inTag] = ["", 0, 0, () => lt > gt]
		for (let [i, arg] of this.vResult.args.entries()) {
			let string = this.vResult.strings[i]
			html += string
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]

			if (inTag()) {
				html += this.initProp()
			} else if (
				arg instanceof VResult &&
				this.vResult.isSame(this.vResult)
				){
				html += this.initVResult()
			}
			else if (
				!inTag() &&
				Array.isArray(arg) &&
				arg[0] instanceof VResult
			) {
				html += this.initList()
			} else if (!inTag()) {
				html += this.initText()
			}
		}
		html += this.vResult.strings.at(-1)
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
		let data = { selector: unique(), handleType: "__LIST__", vanyls: {} }
		this.datas.push(data)
		return `<wbr ${data.selector}>`
	}
	initVResult(){
		let data = { selector: unique(), handleType: "__VRESULT__", vanyl: new Vanyl(v``) }
		this.datas.push(data)
		return `${data.selector + "vresult:"}<wbr ${data.selector}>`		
	}
	updateWith(vResultFresh) {
		if (!this.vResult.isSame(vResultFresh)) throw new Error(`.updateWith() got not same vResult`)
		for (let [i, data] of this.datas.entries()) {
			let arg = vResultFresh.args[i]
			if (data.handleType == "__LIST__") {
				let frag = document.createDocumentFragment()
				for (let vResult of arg) {
					let dataVanyl = data.vanyls[vResult.key] // take vResult in display
					if (dataVanyl) {
						frag.appendChild(dataVanyl.topElement)
						setTimeout(()=>dataVanyl.updateWith(vResult), 4) // needs a better solution
					}
					else {
						let vanylToAdd = new Vanyl(vResult)
						//!1 vanylToAdd.grabFirstChild()
						vanylToAdd.updateWith(vResult)
						frag.appendChild(vanylToAdd.topElement)
						data.vanyls[vanylToAdd.vResult.key] = vanylToAdd
					}
					// remove old data vanyl that's not in arg. (identified with key)
					for (let vanyl of Object.values(data.vanyls)){
						////// if (!arg.map(vr=>vr.key).includes(vanyl.vResult.key)) vanyl.topElement.remove() // also works and is more basic but .some is performant
						if (!arg.some(vr=>vanyl.vResult.key==vr.key)) vanyl.topElement.remove()
					}
				}
				data.element.after(frag)
			}
			else if (data.handleType == "__TEXT__") 
				data.element.nodeValue = arg
			else if (data.handleType == "__PROPS__") 
				for (let key in arg) data.element[key] = arg[key]
			else if (data.handleType == "__VRESULT__") {
				if (data.vanyl.vResult.isSame(arg)) data.vanyl.updateWith(arg)
				else {
					data.vanyl.topElement?.remove()
					data.vanyl = new Vanyl(arg)
					//!1 data.vanyl.grabFirstChild()
					data.element.after(data.vanyl.topElement)
					data.vanyl.updateWith(arg)
				}
			}		}
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
			if (data.handleType == "__TEXT__") {
				let textNode = document.createTextNode(data.selector)
				data.element.replaceWith(textNode)
				data.element = textNode
			}
		}
	}
	grabFirstChild() {
		this.domik = new DOMParser().parseFromString(this.html, "text/html")
		let topElement = this.domik.body.firstChild
		return topElement
	}
}

export const v = (...argums) => new VResult(...argums)

export const create = vFun => {
	let vanyl = Vanyl.fromVFun(vFun)
	//!1 vanyl.grabFirstChild()
	return vanyl
}

