export class Vanyl {
	unique = ((counter = 0) => () => `um${counter++}`)()
	constructor(vResult) {
		this.vResult = vResult
	}
	datas = [] // [{handleType:"text", element: div}]
	initProp() {
		let data = { selector: this.unique(), handleType: "props" }
		this.datas.push(data)
		return `${data.selector}`
	}
	initText() {
		let data = { selector: this.unique(), handleType: "text" }
		this.datas.push(data)
		return `<b ${data.selector}>${data.selector}</b>`
	}
	init() {
		let [result, lt, gt] = ["", 0, 0]
		for (let [i, arg] of this.vResult.args.entries()) {
			let string = this.vResult.strings[i]
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
			result += string + (lt > gt ? this.initProp() : this.initText())
		}
		return result + this.vResult.strings.at(-1)
	}
	updateWith(freshVResult) {
		for (let [i, data] of this.datas.entries()) {
			let arg = freshVResult.args[i]
			if (data.handleType == "text") {
				data.element.innerHTML = arg
			} else if (data.handleType == "props") {
				for (let [key, value] of Object.entries(arg)) data.element[key] = value
			}
		}
		return this
	}
	update() {
		return this.updateWith(this.vFun())
	}
	processData() {
		for (let data of this.datas)
			data.element = this.topElement.querySelector(`[${data.selector}]`)
	}
	static fromVFun(vFun) {
		let vanyl = new Vanyl(vFun())
		vanyl.vFun = vFun
		return vanyl
	}
	takeFirstChild() {
		this.domik = new DOMParser().parseFromString(this.init(), "text/html")
		this.topElement = this.domik.body.firstChild
		console.log(this.topElement)
	}
	// static vResult = class {} // to check if typeof vResult
	static v = (strings, ...args) => ({ strings, args }) // -> [{strings: [''], args: [any]}]
	static sync(vFun, topElement) {
		let vanyl = Vanyl.fromVFun(vFun)
		vanyl.topElement = topElement
		vanyl.topElement.innerHTML = vanyl.init() //~
		vanyl.processData()
		return vanyl
	}
	static create(vFun) {
		let vanyl = Vanyl.fromVFun(vFun)
		vanyl.takeFirstChild()
		vanyl.processData()
		return vanyl
	}
	addTo(element) {
		this.topElement.remove()
		element.appendChild(this.topElement)
		return this
	}
}
