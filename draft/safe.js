/*let unique = (() => {
	let uniqueAttribute = 0
	uniqueAttribute++
	return () => `um${uniqueAttribute}`
})()

class Controller {
	marks = []
	constructor(vFun) {
		this.vFun = vFun
	}
	refreshMakrs(){
		this.vResult = this.vFun()
		this.strings = this.vResult.strings
		this.marks = this.vResult.marks

	}
	init() {
		let result = ""

		for (let [mark, i] of this.marks.entries()) {
			result += mark.init({
				controller: this,
				i,
			})
		}

		return "string"
	}
	update() {
		this.freshMarks = this.vFun()
		for (let [mark, i] of this.marks.entries()) {
			let freshMark = freshMarks[i]
			mark.refresh(freshMark)
		}
	}
	sync(element) {
		this.element = element
		this.element.innerHTML = this.init()
	}
	takeFirstChild() {
		this.fragment = createDocumentFragment()
		this.fragment.innerHTML = this.init()
		this.element = this.fragment.firstChild()
	}
}

class Mark {
	// constructor(...args) {
		// this.controller = controller
	// }
	get string(){
		return this.controller.strings[this.i]
	}
	get data(){
		return this.controller.marks[this.i]
	}
	init({controller, i}){
		this.controller	= controller
		this.i = i
	}
}

class Text {
	constructor(text) {
		super(...arguments)
	}
	intit(Controller,i) {
		super.init(...arguments)
	}
	sync() {}
	refresh(fresh) {}
}

let text = (...args) => new Text(...args)

let v = (strings, ...marks) => ({ strings, marks })

let sync = (vFun, element) => {
	let controller = new Controller(vFun)
	controller.sync(element)
}
*/