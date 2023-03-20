import {VanylElement, v, tag} from '/src/index.js'

tag["a-el"] = class extends VanylElement{
	render(){
		return v`
		<vanyl-element></vanyl-element> <br>
		<vanyl-element></vanyl-element>
		`
	}
}

tag["b-el"] = class extends VanylElement {
	render(){
		return v`
			<a-el></a-el>
		`
	}
}

let myComponent = document.createElement('b-el')
myComponent.onclick = e => myComponent.update()

document.body.appendChild(myComponent)