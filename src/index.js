let unique = ((counter = 0) => () => `V${counter++}`)()
let keyOf = vResult => vResult.args[0].key

export class Vanyl {
	constructor(vResult) {
		this.vResult = vResult
		let [html, lt, gt, inTag] = ["", 0, 0, ()=>lt>gt]
		for (let [i, arg] of this.vResult.args.entries()) {
			let string = this.vResult.strings[i]
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]

			if (inTag()){
				html += string + this.initProp()
			}
			else if(!inTag() && Array.isArray(arg) && arg[0] instanceof Vanyl.vResult){
				html+=string + this.initList()
				console.log('vResuluut')
			}
			else if (!inTag()){
				html += string + (lt > gt ? this.initProp() : this.initText())
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
		return `<b ${data.selector}>${data.selector}</b>`
	}
	initList() {
		let data = { selector: unique(), handleType: "list", vanyls:{} }
		this.datas.push(data)
		return `<b ${data.selector}>${data.selector}</b>`
	}
	// init() {
	// }
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
				for (let vResult of arg) keyedArg[keyOf(vResult)] = vResult
				for (let vResult of arg){
					let dataVanyl = data.vanyls[keyOf(vResult)] // take vResult in display
					if (!dataVanyl){
						let vanylToAdd = new Vanyl(vResult)
						vanylToAdd.grabFirstChild()
						vanylToAdd.addTo(frag)
						data.vanyls[keyOf(vanylToAdd.vResult)] = vanylToAdd
						vanylToAdd.updateWith(vResult)
					}
					else {
						dataVanyl.addTo(frag)
						dataVanyl.updateWith(vResult)
					}
				}
				for (let [vanylKey, vanyl] of Object.entries(data.vanyls)){
					if (!keyedArg[vanylKey]) vanyl.topElement.remove()
					// console.log(vanyl)
				}

				// let dataVanylArr = Object.entries(data.vanyls).map(([_,vanyl])=>vanyl)
				for (let [i, vResult] of arg.entries()){

					// console.log(i, vResult)

				}

				this.topElement.appendChild(frag)

				// for (let [key, vResult] of Object.entries(keyedArg)){
				// 	if (data.vanyls[key]) {
				// 		// console.log(data.va)
				// 		data.vanyls[key].updateWith(vResult)
				// 		console.log('update',key)
				// 	}
				// 	else{
				// 		let vanyl = new Vanyl(vResult)		
				// 		vanyl.grabFirstChild()
				// 		vanyl.addTo(this.topElement)
				// 		data.vanyls[key] = vanyl
				// 		vanyl.updateWith(vResult)
				// 		console.log(vanyl)
				// 	}
				// }
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

