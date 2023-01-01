let uniqueAttribute = (() => {
	let ___uniqueAttribute = 0
	return () => `um${___uniqueAttribute++}`
})()

let attrSelector = attr => `[${attr}]`

class Controller {
	// marks[]; vResult; ?vFun();
	constructor(vResult) {
		this.vResult = vResult
		this.marks = vResult.markNotes.map(markNote=>new markNote.cls(...markNote.args))
	}
	static fromVFun(vFun) {
		let controller = new this(vFun())
		controller.vFun = vFun
		return controller
	}
	initMarks() {
		let result = ""
		for (let [i, permaMark] of this.marks.entries()) {
			result += permaMark.init({
				controller: this,
				i,
			}).writes
		}
		return result + this.vResult.strings.at(-1)
	}
	updateWith(freshResult) {
		let freshMarkNotes = freshResult.markNotes
		for (let [i, permaMark] of this.marks.entries()) {
			let freshMarkNote = freshMarkNotes[i]
			permaMark.refresh(...freshMarkNote.args)
		}
	}
	update() {
		this.updateWith(this.vFun())
	}
	processMarks() {
		for (let permaMark of this.marks) permaMark.process()
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
		return this.controller.vResult.markNotes[this.i]
	}
	init({ controller, i }) {
		this.controller = controller
		this.i = i
		return {
			writes: this.string,
		}
	}
	process(){}
	refresh(){}
}

class Text extends Mark {
	constructor(text) {
		super(...arguments)
	}
	init(Controller, i) {
		super.init(...arguments)
		this.selectorAttr = uniqueAttribute()
		return {
			writes: this.string + `<b ${this.selectorAttr}>${this.selectorAttr}</b>`,
		}
	}
	process() {
		super.process(...arguments)
		this.element = this.controller.topElement.querySelector(
			attrSelector(this.selectorAttr)
		)
	}
	refresh(text) {
		super.refresh(...arguments)
		this.element.innerHTML = text
	}
}
export let text = (...args) => ({cls:Text, args:args})

class Attr extends Mark {
	constructor(attributeName, attributeValue) {
		super(...arguments)
		this.attributeName = attributeName // it shouldn't change per Attr Mark
	}
	init(Controller, i) {
		super.init(...arguments)
		this.selectorAttr = uniqueAttribute()
		return {
			writes: this.string + this.selectorAttr
		}
	}
	process() {
		super.process(...arguments)
		this.element = this.controller.topElement.querySelector(
			attrSelector(this.selectorAttr)
		)
	}
	refresh(attributeName, attributeValue) {
		super.refresh(...arguments)
		this.element.setAttribute(this.attributeName, attributeValue)
	}
}
export let attr = (...args) => ({cls:Attr, args:args})


export let v = (strings, ...markNotes) => ({ strings, markNotes })

export let sync = (vFun, topElement) => {
	let controller = Controller.fromVFun(vFun)
	controller.syncTo(topElement)
	return controller
}

// vResult {strings: [string], markNotes: [markNote]}
// markNote {cls:Mark, args: []}
export let render = vFun => { // -> [vResult]
	let controller = Controller.fromVFun(vFun)
	controller.takeFirstChild()
	return controller
}
