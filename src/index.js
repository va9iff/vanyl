let uniqueAttribute = (() => {
	let ___uniqueAttribute = 0
	return () => `um${___uniqueAttribute++}`
})()

let attrSelector = attr => `[${attr}]`

class Controller {
	// permaMarks[]; vResult; ?vFun();
	constructor(vResult) {
		this.vResult = vResult
		this.permaMarks = vResult.marks
	}
	static fromVFun(vFun) {
		let controller = new this(vFun())
		controller.vFun = vFun
		return controller
	}
	initMarks() {
		let result = ""
		for (let [i, permaMark] of this.permaMarks.entries()) {
			result += permaMark.init({
				controller: this,
				i,
			}).writes
		}
		return result
	}
	updateWith(freshResult) {
		let freshMarks = freshResult.marks
		for (let [i, permaMark] of this.permaMarks.entries()) {
			let freshMark = freshMarks[i]
			permaMark.refresh(freshMark)
		}
	}
	update() {
		this.updateWith(this.vFun())
	}
	processMarks() {
		for (let permaMark of this.permaMarks) permaMark.process()
	}
	syncTo(topElement) {
		this.topElement = topElement
		this.topElement.innerHTML = this.initMarks() //~
		this.processMarks()
	}
	takeFirstChild() {
		this.fragment = this?.createDocumentFragment() // ? for linter
		this.fragment.innerHTML = this.initMarks()
		if ([...this.fragment.childNodes].length > 3)
			throw `more than text, node, text`
		this.topElement = this.fragment.firstChild()
	}
}

class Mark {
	constructor(){}
	get string() {
		return this.controller.vResult.strings[this.i]
	}
	get data() {
		return this.controller.vResult.marks[this.i]
	}
	init({ controller, i }) {
		this.controller = controller
		this.i = i
		return {
			writes: this.string,
		}
	}
}

class Text extends Mark {
	constructor(text) {
		super(...arguments)
		this.text = text
	}
	init(Controller, i) {
		super.init(...arguments)
		this.selectorAttr = uniqueAttribute()
		return {
			writes: this.string + `<b ${this.selectorAttr}>${this.selectorAttr}</b>`,
		}
	}
	process() {
		this.element = this.controller.topElement.querySelector(
			attrSelector(this.selectorAttr)
		)
	}
	refresh(fresh) {
		this.text = fresh.text
		this.element.innerHTML = fresh.text
	}
}

export let text = (...args) => new Text(...args)

export let v = (strings, ...marks) => ({ strings, marks })

export let sync = (vFun, topElement) => {
	let controller = Controller.fromVFun(vFun)
	controller.syncTo(topElement)
	return controller
}

export let render = vFun => {
	let controller = Controller.fromVFun(vFun)
	controller.takeFirstChild()
	return controller
}
