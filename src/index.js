let unique = (() => {
	let ___u___ = 0
	return () => `um${___u___++}`
})()

class Controller {
	constructor(vResult) {
		this.vResult = vResult
	}
	static fromVFun(vFun) {
		let controller = new this(vFun())
		controller.vFun = vFun
		return controller
	}
	datas = [] // [{for:"text", element: div}]
	markProp() {
		let data = { unique: unique(), for: "props" }
		this.datas.push(data)
		console.log(data.unique)
		return data.unique
	}
	markText() {
		let data = { unique: unique(), for: "text" }
		this.datas.push(data)
		console.log(data.unique)
		return `<b ${data.unique}>${data.unique}</b>`
	}
	init() {
		let result = ""
		let [lt, gt] = [0, 0]
		for (let [i, arg] of this.vResult.args.entries()) {
			let string = this.vResult.strings[i]
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
			result += string + (lt > gt ? this.markProp() : this.markText())
		}
		return result + this.vResult.strings.at(-1)
	}
	updateWith(freshVResult) {
		let args = freshVResult.args
		for (let [i, data] of this.datas.entries()) {
			let arg = args[i]
			if (data.for == "text") {
				data.element.innerHTML = arg
			} else if (data.for == "props") {
				for (let [key, value] of Object.entries(arg)) data.element[key] = value
			}
		}
	}
	update() {
		this.updateWith(this.vFun())
	}
	processMarks() {
		for (let data of this.datas)
			data.element = this.topElement.querySelector(`[${data.unique}]`)
	}
	syncTo(topElement) {
		this.topElement = topElement
		this.topElement.innerHTML = this.init() //~
		this.processMarks()
	}
	/*takeFirstChild() {
		// this.fragment = new DocumentFragment();
		// this.fragment.innerHTML = this.init()
		this.parser = new DOMParser();
		// const htmlString = "<strong>Beware of the leopard</strong>";
		const htmlString = this.init();
		this.domik = this.parser.parseFromString(htmlString, "text/html");
		console.log(this.domik)
		this.topElement = this.domik.body.firstChild
		console.log(this.topElement)
	}*/
}

export let v = (strings, ...args) => ({ strings, args })

export let sync = (vFun, topElement) => {
	let controller = Controller.fromVFun(vFun)
	controller.syncTo(topElement)
	return controller
}

// arg: any
// vResult: {strings: [''], args: [arg]}
export let render = vFun => {
	// -> [vResult]
	let controller = Controller.fromVFun(vFun)
	controller.takeFirstChild()
	return controller
}
