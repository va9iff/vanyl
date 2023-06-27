export const unique = ((counter = 0) => () => `V${counter++}`)()

import {expect} from "./expect.js"
// const expect = {} // weird way to remove optional object to be a single file

import { v, VResult } from './vResult.js'
// import { prettyPropsInit, prettyPropsUpdate } from "./props.js"
import { The } from "./the.js"

export function markHtml(vResult) {
	let [html, datas, lt, gt] = ["", [], 0, 0]
	for (const [i, arg] of vResult.args.entries()) {
		const string = vResult.strings[i]
		html += string
		;[gt, lt] = [gt + string.split(">").length, lt + string.split("<").length]
		const data = { selector: unique(), /*last:"",*/ inTag: lt > gt, i }
		/* I'm not sure about using .last=="vResult" style.*/
		/* i'ts been some time since my last commits. I have to get my hands warmer */
		if (data.inTag) html += ` ${data.selector} `
		else html += `<wbr ${data.selector}>`
		datas.push(data)
	}
	html += vResult.strings.at(-1)
	return [html, datas]
}

export class Vanyl {
	opts(opts = {}){
		if (opts?.vFun) this.vFun = opts.vFun
		if (opts?.root) this.root = opts.root
	}
	constructor(vResult = v`<b>empty v</b>`, opts = {}) {
		this.opts(opts)
		let [html, datas] = markHtml(vResult)
		this.html = html 
		this.datas = datas 
		this.root ||= this.getRoot(this.html)

		this.vResult = vResult
		this.process(vResult)

		this.updateWith(vResult)
	}
	vFun() {
		return v`V~${this.constructor.name}`
	}
	/* wanna use something like .core in .updateWith 
		vResult and text in list? we have an way for them saperate.
		use something like that in the list too.
		currently only accapets vResult.
		I also want to add HTMLElement with ${} syntax.

		being the 4th case others being:
			any: in the tag, for syncing values
			vResult: to use Vanyl's dynamic stuff dynamically (bruh)
			list: to render list of vResults (add text and elements)
			+ element: to append elements on the fly
			any: anything else will be for dynamic text outside of tag
	*/
	updateWith(vResultFresh) {
		expect.sameVResult?.(this.vResult, vResultFresh)
		this.vResult = vResultFresh
		for (const data of this.datas) {
			const arg = this.vResult.args[data.i]

			/* props */
			if (data.inTag) {

				// prettyPropsUpdate(arg,data.element)

				// I can't see where the element comes from prop name "the"
				this.the.updateWith(arg)
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
	process(vResult) {
		for (const data of this.datas) {
			data.element = this.root.hasAttribute(data.selector)
				? this.root
				: this.root.querySelector(`[${data.selector}]`)
			expect.notNull?.(data.element) // can be textnode if v`` isn't wrapped in a tag
			// data.element.removeAttribute(data.selector)
			if (data.inTag) {
				this.the = new The(data.element, vResult.args[data.i])
			}
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


export const create = vFun => new Vanyl(vFun(), { vFun: vFun })