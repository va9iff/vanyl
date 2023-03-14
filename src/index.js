export const unique = ((counter = 0) => () => `V${counter++}`)()

import {expect} from "./expect.js"
// const expect = {} // weird way to remove optional object to be a single file

class VResult {
	constructor(strings, ...args) {
		;[this.strings, this.args] = [strings, args]
	}
	get key() {
		return this.args?.[0]?.key
	}
	get keep() {
		return this.args[0].keep
	}
	isSame(_vResult) {
		return (
			this.strings.length == _vResult.strings.length &&
			this.strings.every((s, i) => this.strings[i] == _vResult.strings[i])
		)
	}
	static ish(arg) {
		return arg instanceof VResult ? arg : v`${arg}`
	}
}
export const v = (...argums) => new VResult(...argums)

export class Lazy {
	constructor(initialValue) {
		this.initialValue = initialValue
	}
	get now() {
		if (this.element) return this.element[this.prop]
		return this.initialValue
	}
	set now(newValue) {
		this.element[this.prop] = newValue
	}
	vDirectiveInit(key, val, element){
		// key == key, val == this, element == this.element
		console.log(...arguments)
		// val.element = element
		// val.prop = key
		// val.element[val.prop] = val.initialValue

		this.element = element
		this.prop = key
		console.log(key, this.element[key])
		this.element[this.prop] = this.initialValue
		return true // don't treat it like normal a prop and don't assign it
	}
	vDirectiveUpdate(){
		return true
	}
}

export const ref = (fun = () => fun.element ?? null) => fun

function prettyPropsInit(propsObj, element){
	for (const [key, val] of Object.entries(propsObj)) {
		const $key = key.slice(1)
		if (key[0] == "@") element.addEventListener($key, val)
		else if (key == "ref") val.element = element
		else if (val.vDirectiveInit?.(key, val, element)) "just stop"
	}
}
function prettyPropsUpdate(propsObj, element) {
	for (const [key, val] of Object.entries(propsObj)) {
		const $key = key.slice(1)
		if (val.vDirectiveUpdate?.(key, val, element) || key == "ref") "just stop"
		else if (key[0] == ".")
			if (val) element.classList.add($key)
			else element.classList.remove($key)
		else element[key] = val
	}
}


function markHtml(vResult) {
	let [html, datas, lt, gt] = ["", [], 0, 0]
	for (const [i, arg] of vResult.args.entries()) {
		const string = vResult.strings[i]
		html += string
		;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
		const data = { selector: unique(), inTag: lt > gt, i }
		if (data.inTag) html += ` ${data.selector} `
		else html += ` <wbr ${data.selector}> `
		datas.push(data)
	}
	html += vResult.strings.at(-1)
	return [html, datas]
}

export class Vanyl {
	constructor(vResult = v`<b>empty v</b>`) {
		[this.html, this.datas] = markHtml(vResult)
		this.root = this.getRoot(this.html)

		this.vResult = vResult
		this.process(vResult)

		this.updateWith(vResult)
	}
	vFun() {
		return v`V~${this.constructor.name}`
	}
	updateWith(vResultFresh) {
		expect.sameVResult?.(this.vResult, vResultFresh)
		this.vResult = vResultFresh
		for (const data of this.datas) {
			const arg = this.vResult.args[data.i]

			/* props */
			if (data.inTag) {
				prettyPropsUpdate(arg,data.element)
				continue
			}

			/* vResult */
			if (arg instanceof VResult) {
				// oh my... data.vResult. hurts my eyes
				data.element.nodeValue &&= "" // clear if there's any
				data.vResult ??= { vanyls: [] }
				if (data.vResult.last?.vResult.isSame(arg))
					data.vResult.last.updateWith(arg)
				else {
					data.vResult.last?.root.remove()
					data.vResult.last = data.vResult.vanyls.find(vanyl =>
						vanyl.vResult.isSame(arg)
					)
					if (!data.vResult.last) {
						data.vResult.last = new Vanyl(arg)
						data.vResult.vanyls.push(data.vResult.last)
					}
					data.element.after(data.vResult.last.root)
				}
				continue
			} else if (data.vResult?.last) {
				data.vResult.last.root.remove()
				data.vResult.last = null
			}

			/* list */
			// if rendered List at least once and also the last time,
			if (data.list?.last) {
				// remove all keyless from last update
				while (data.list.vanylsKeylessLast.length > 0)
					data.list.vanylsKeylessLast.pop().root.remove()
				// remove last displaying keyed vanyls if arg doesn't have them
				for (const dataVanyl of data.list.vanylsKeyedLast) {
					if (arg.every?.(_vResult => dataVanyl.vResult.key != _vResult.key))
						data.list.vanylsKeyed[dataVanyl.vResult.key].root.remove()
				}
				data.list.last = false
				// data.list.vanylsKeylessLast = [] // this will be [] with .pop()
				data.list.vanylsKeyedLast = []
			}
			if (Array.isArray(arg)) {
				data.element.nodeValue &&= "" // clear if there's any

				data.list ??= {
					vanylsKeyed: {},
					vanylsKeylessLast: [],
					vanylsKeyedLast: [],
					// if the last call wasn't an array update, don't check for
					// removes as there's no added vanyls since last remove.
					last: true,
				}
				const frag = document.createDocumentFragment()
				for (let vResult of arg) {
					let vanyl = data.list.vanylsKeyed[vResult.key] // take vResult in display
					if (vanyl) {
						// can raise when array gets non-same vResults with same keys
						vanyl.updateWith(vResult)
						data.list.vanylsKeyedLast.push(vanyl)
					} else if (vResult.key) {
						vanyl = new Vanyl(vResult)
						data.list.vanylsKeyed[vanyl.vResult.key] = vanyl
						data.list.vanylsKeyedLast.push(vanyl)
					} else {
						vanyl = new Vanyl(vResult)
						data.list.vanylsKeylessLast.push(vanyl)
					}
					frag.appendChild(vanyl.root)
				}
				data.element.after(frag)
				data.list.last = true
			}
			/* text */
			else {
				// arg is whatever, assign as dynamic text
				data.element.nodeValue = arg
				continue
			}
		}
		return this
	}
	update() {
		return this.updateWith(this.vFun())
	}
	static fromVFun(vFun) {
		const vanyl = new Vanyl(vFun())
		vanyl.vFun = vFun
		return vanyl
	}
	process(vResult) {
		for (const data of this.datas) {
			data.element = this.root.hasAttribute(data.selector)
				? this.root
				: this.root.querySelector(`[${data.selector}]`)
			expect.notNull?.(data.element) // can be textnode if v`` isn't wrapped in a tag
			// data.element.removeAttribute(data.selector)
			if (data.inTag) prettyPropsInit(vResult.args[data.i], data.element)
			else {
				const textNode = document.createTextNode(data.selector)
				data.element.replaceWith(textNode)
				data.element = textNode
			}
		}
	}
	getRoot(htmlString){
		const domik = new DOMParser().parseFromString(htmlString, "text/html")
		expect.oneChildElementCount?.(domik.body)
		const root = domik.body.children[0]
		expect.notNull?.(root) // lets keep to see if it will rise ever.
		return root
	}
}


export const create = vFun => Vanyl.fromVFun(vFun)
