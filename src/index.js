let [___u___, unique] = [0, () => `um${___u___++}`]

let handlers = {
	text: {
		init(controller, i){

		}
	}
}

class Controller {
	constructor(vResult) {
		this.vResult = vResult
	}
	datas = [] // [{handleType:"text", element: div}]
	initProp() {
		let data = { id: unique(), handleType: "props" }
		this.datas.push(data)
		console.log(data.id)
		return data.id
	}
	initText() {
		let data = { id: unique(), handleType: "text" }
		this.datas.push(data)
		console.log(data.id)
		return `<b ${data.id}>${data.id}</b>`
	}
	init() {
		let result = ""
		let [lt, gt] = [0, 0]
		for (let [i, arg] of this.vResult.args.entries()) {
			let string = this.vResult.strings[i]
			;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
			result += string + (lt > gt ? this.initProp() : this.initText())
		}
		return result + this.vResult.strings.at(-1)
	}
	updateWith(freshVResult) {
		let args = freshVResult.args
		for (let [i, data] of this.datas.entries()) {
			let arg = args[i]
			if (data.handleType == "text") {
				data.element.innerHTML = arg
			} else if (data.handleType == "props") {
				for (let [key, value] of Object.entries(arg)) data.element[key] = value
			}
		}
	}
	update() {
		this.updateWith(this.vFun())
	}
	processData() {
		for (let data of this.datas)
			data.element = this.topElement.querySelector(`[${data.id}]`)
	}
	static fromVFun(vFun) {
		let controller = new this(vFun())
		controller.vFun = vFun
		return controller
	}
	syncTo(topElement) {
		this.topElement = topElement
		this.topElement.innerHTML = this.init() //~
		this.processData()
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
