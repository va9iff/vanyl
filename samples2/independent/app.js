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

export function markHtml(vResult) {
	const { strings, args } = vResult
	let [html, datas, lt, gt] = ["", [], 0, 0]
	for (let i = 0; i < args.length; i++) {
		const arg = args[i],
			string = strings[i]
		html += string
		gt = gt + string.split(">").length
		lt = lt + string.split("<").length
		const data = { arg, inTag: lt > gt, i }
		if (data.inTag) html += ` V${i} `
		else html += `<wbr V${i}>`
		datas.push(data)
	}
	html += strings.at(-1)
	return [html, datas]
}

class VanylController{
	constructor(root, vResult){
		let [html, datas] = markHtml(vResult)
		this.root = root
		root.innerHTML = html
		this.process(datas)
	}
	process(datas){
		for (const data of datas) {
			data.element = this.root.querySelector(`[V${data.i}]`)
			if (data.inTag) null
			else {
				const textNode = document.createTextNode(data.arg)
				data.element.replaceWith(textNode)
				data.element = textNode
			}
		}
	}
}

new VanylController(document.body, v`
		hi ${4} <b>bora</b>
	`)

