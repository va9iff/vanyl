export class VResult {
	constructor(strings, ...args) {
		this.strings = strings
		this.args = args
	}
	isSame(_vResult) {
		return (
			this.strings.length == _vResult.strings.length &&
			this.strings.every((s, i) => this.strings[i] == _vResult.strings[i])
		)
	}
}
export function v() {
	return new VResult(...arguments)
}

export function adata() {
	return {
		callNext: true,
	}
}

export function markHtml(vResult) {
	const { strings, args } = vResult
	let [html, datas, lt, gt] = ["", [], 0, 0]
	for (let i = 0; i < args.length; i++) {
		const arg = args[i],
			string = strings[i]
		html += string
		gt = gt + string.split(">").length
		lt = lt + string.split("<").length
		const data = { ...adata(), arg, i, inTag: lt > gt }
		if (data.inTag) html += ` V${i} `
		else html += `<wbr V${i}>`
		datas.push(data)
	}
	html += strings.at(-1)
	return [html, datas]
}

const updater = Symbol("updater")

class VanylController {
	constructor(root, vResult) {
		let [html, datas] = markHtml(vResult)
		this.datas = datas
		this.root = root
		root.innerHTML = html
		this.process(datas)
	}
	process(datas) {
		for (const data of datas) {
			data.element = this.root.querySelector(`[V${data.i}]`)
			if (data.inTag) {
			} else {
				const textNode = document.createTextNode(data.arg)
				data.element.replaceWith(textNode)
				data.element = textNode
			}
		}
	}
	update(vResult) {
		for (const data of this.datas) {
			const arg = vResult.args[data.i]
			if (data.inTag) {
				if (typeof arg == "object") {
					this.updateProps(data.element, arg, data.arg)
					data.arg = arg
				} else if (typeof arg == "function") {
					if (data.callNext) data.callNext = arg(data.element) == updater
				}
			} else if (arg instanceof VResult) {
			} else if (Array.isArray(arg)) {
			} else if (typeof arg == "string") {
				data.element.nodeValue = arg
			}
		}
	}
	updateProps(target, props, oldProps = {}) {
		for (let prop in props) {
			if (props[prop] !== oldProps[prop]) {
				target[prop] = props[prop]
			}
		}
	}
}

let f = (a = false, b = 0) => v`
	<button ${{
		disabled: a,
	}}
	${el => {
		alert(el)
	}}
	${el => {
		console.log(el)
		return updater
	}}
	>hi
	</button>
`

let c = new VanylController(document.body, f())

setInterval(() => {
	c.update(f(Math.random() > 0.5))
}, 500)
