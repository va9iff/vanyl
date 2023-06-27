export const v = (strings, ...args) => ({strings, args})

export class VanylElement extends HTMLElement {
	$prop = "fased" // those won't get looked in constructor. it'll be in connec
	static props = {

	}
	static attrs = {
		
	}
	constructor(){
		super()
	}
	hasInit = false
	init(){
		this.getStringHtml()

		this.hasInit = true
	}
	render(){
		return v`<p>~VanylElement</p>`
	}
	data = []
	getStringHtml(){
		let vr = this.render(),
			html = ""
		for (let i = 0; i < vr.strings.length - 1; i++){
			const [string, arg] = [vr.strings[i], vr.args[i]]
			html += string
			if (Array.isArray(arg)){
				let index = this.data.push({
					is: "array",
					was: null,
					el: null,
					arg: args[i],
				})
				html+= `<wbr i${index}>`
			}

			console.log(string, arg)
		}
	}
	update() {
		this.vanyl.updateWith(this.render())
	}
	connectedCallback() {
		console.log('connected')
		if (!this.hasInit) return this.init()
	}
	static define(tagName, opts){
		customElements.define(tagName, this, opts);
	}
}

VanylElement.define('vanyl-element')
