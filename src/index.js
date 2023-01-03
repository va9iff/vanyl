let unique = ((counter = 0) => () => `um${counter++}`)()

export class Vanyl {
	constructor(vResult) {
		this.vResult = vResult
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
	init() {
		let [result, lt, gt, inTag] = ["", 0, 0, ()=>lt>gt]
		for (let [i, arg] of this.vResult.args.entries()) {
			let string = this.vResult.strings[i]
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]

			if (inTag()){
				result += string + this.initProp()
			}
			else if(!inTag() && Array.isArray(arg) && arg[0] instanceof Vanyl.vResult){
				result+=string + this.initList()
				console.log('vResuluut')
			}
			else if (!inTag()){
				result += string + (lt > gt ? this.initProp() : this.initText())
			}
		}
		return result + this.vResult.strings.at(-1)
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
				// console.log(data)
				// for (let [key, vanylInDisplay] of Object.entries(data.vanyls)){
					// if (arg.includes(vanylInDisplay)) {
						// vanylInDisplay.updateWith(arg)
					// }
				// }
				let keyedArg = {}					  //obj.vreslult.arr.{key}.key 
				for (let vResult of arg) keyedArg[vResult.args[0].key] = vResult

					//////////////////////////////////////

				for (let vResult of arg){
					let dataVanyl = data.vanyls[vResult.args[0].key]
					if (!dataVanyl){
						// console.log(data.vanyls)
						let vanylToAdd = new Vanyl(vResult)
						vanylToAdd.grabFirstChild()
						vanylToAdd.addTo(this.topElement)
						// console.log('set',vanylToAdd.vResult.args[0].key, vanylToAdd)
						// console.log(vanylToAdd.vResult.args[0].key)
						data.vanyls[vanylToAdd.vResult.args[0].key] = vanylToAdd
						vanylToAdd.updateWith(vResult)
					}
					else {
						dataVanyl.updateWith(vResult)
					}
				}
				for (let [vanylKey, vanyl] of Object.entries(data.vanyls)){
					if (!keyedArg[vanylKey]) vanyl.topElement.remove()
					// console.log(vanyl)
				}

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
		processData() {
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
		this.domik = new DOMParser().parseFromString(this.init(), "text/html")
		this.topElement = this.domik.body.firstChild
		this.processData()
		// console.log(this.topElement)
	}
	static vResult = class vResult {
		constructor(strings, ...args) {
			;[this.strings, this.args] = [strings, args]
		}
	} // to check if typeof vResult
	addTo(element) {
		this.topElement.remove()
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

export const sync = (vFun, topElement) => {
		let vanyl = Vanyl.fromVFun(vFun)
		vanyl.topElement = topElement
		vanyl.topElement.innerHTML = vanyl.init() //~
		return vanyl
	}

