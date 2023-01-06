let unique = ((counter = 0) => () => `V${counter++}`)()

export class Vanyl {
	constructor(vResult) {
		this.vResult = vResult
		let [html, lt, gt, inTag] = ["", 0, 0, ()=>lt>gt]
		for (let [i, arg] of vResult.args.entries()) {
			let string = vResult.strings[i]
			html+=string
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]

			if (inTag()){
				html += this.initProp()
			}
			else if(!inTag() && Array.isArray(arg) && arg[0] instanceof Vanyl.vResult){
				html += this.initList()
				console.log('vResuluut')
			}
			else if (!inTag()){
				html += this.initText()
			}
		}
		this.html = html + this.vResult.strings.at(-1)
		// console.log(html)
	}
	vFun(){
		return v`V~`
	}
	datas = [] // [{handleType:"text", element: div}]
	initProp() {
		let data = { selector: unique(), handleType: "props" }
		this.datas.push(data)
		return `${data.selector}`
	}
	initText() {
		let data = { selector: unique(), handleType: "text" }
		this.datas.push(data)
		return `<b ${data.selector}>${data.selector}text</b>`
	}
	initList() {
		let data = { selector: unique(), handleType: "list", vanyls:{} }
		this.datas.push(data)
		return `${data.selector+'list'}<wbr ${data.selector}>`
	}
	updateWith(freshVResult) {
		for (let [i, data] of this.datas.entries()) {
			let arg = freshVResult.args[i]
			if (data.handleType == "text") {
				data.element.innerHTML = arg
			} else if (data.handleType == "props") {
				for (let [key, value] of Object.entries(arg)) {
					data.element[key] = value
				}
			} else if (data.handleType == "list"){
					//////////////////////////////////////
				let keyedArg = {}
				let frag = document.createDocumentFragment()
				for (let vResult of arg) keyedArg[vResult.key] = vResult
				for (let vResult of arg){
					let dataVanyl = data.vanyls[vResult.key] // take vResult in display
					if (dataVanyl){
						dataVanyl.addTo(frag)
						dataVanyl.updateWith(vResult)
					}
					else {
						let vanylToAdd = new Vanyl(vResult)
						vanylToAdd.grabFirstChild()
						vanylToAdd.addTo(frag)
						data.vanyls[vanylToAdd.vResult.key] = vanylToAdd
						vanylToAdd.updateWith(vResult)
					}
					if (!arg.some(aVResult=>aVResult.key==vResult.key)) data.vanyls[vResult.key].topElement.remove()
				}
				for (let [vanylKey, vanyl] of Object.entries(data.vanyls))
					if (!keyedArg[vanylKey]) vanyl.topElement.remove()

				data.element.after(frag)
				console.log(data.element)

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
		for (let data of this.datas)
			{
				data.element = this.topElement.querySelector(`[${data.selector}]`)
				// console.log(data.element,data.selector)
				// don't add dynamic prop to top element. it won't find itself
				// console.log(`[${data.selector}]`, this.topElement)
				if (data.element == null) throw new Error('daaa')
				}
	}
	grabFirstChild() {
		this.domik = new DOMParser().parseFromString(this.html, "text/html")
		this.topElement = this.domik.body.firstChild
		this.process()
		// console.log(this.topElement)
	}
	static vResult = class vResult {
		constructor(strings, ...args) {
			;[this.strings, this.args] = [strings, args]
		}
		get key(){
			return this.args[0].key
		}
	} // to check if typeof vResult
	addTo(element) {
		element.appendChild(this.topElement)
		return this
	}
}

export const v = (...argums) => new Vanyl.vResult(...argums) // -> [{strings: [''], args: [any]}]

export const create = (vFun) => {
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

