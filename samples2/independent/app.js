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
		callNext: true
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
	constructor(root, datas) {
		// let [html, datas] = markHtml(vResult)
		this.datas = datas
		this.root = root
		// root.innerHTML = html
		this.process(datas)
	}
	process(datas) {
		for (const data of datas) {
			data.element = this.root.querySelector(`[V${data.i}]`)
			data.element.removeAttribute(`V${data.i}`)
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
				if (data.vResultLast?.isSame(arg)) {
					data.controller.update(arg)
				}
				else {
					const [el, controllerData] = markedFirstChild(arg)
					data.element.replaceWith(el)
					data.element = el
					data.controller = new VanylController(this.root, controllerData)
				}
				data.vResultLast = arg
			} else if (Array.isArray(arg)) {
				// data.controller = new VanylController(this.root, )
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

function markedFirstChild(vr) {
	const [html, datas] = markHtml(vr)
	const domik = new DOMParser().parseFromString(html, "text/html")
	return [domik.body.firstElementChild, datas]
}

// function controlled(vr) {
// 	const [element, datas] = markedFirstChild(vr)
// 	return new VanylController(element, datas)
// }


let f = (a = false, b = 0) => v`
	<button ${{
		disabled: a,
		onclick: ()=> console.log('clicked')
	}}
	>hi
	</button>

	${v`
		<p>
			hi <i>my</i> <b>bro ${parseInt(Math.random()*100)}</b>
		</p>
	`} <br>
	${ab()}
`

let buttonA = ()=> v`<button>a ${parseInt(Math.random()*1000)}</button>`
let buttonB = ()=> v`<button>b ${parseInt(Math.random()*1000)}</button>`
let ab = () => Math.random() > 0.5 ? buttonA() : buttonB()


let vr = f()
// let {strings, args} = vr
let [html, datas] = markHtml(vr)
document.body.innerHTML = html
let c = new VanylController(document.body, datas)

setInterval(() => {
	c.update(f(Math.random() > 0.5))
}, 500)
