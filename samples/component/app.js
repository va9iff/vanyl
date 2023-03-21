import {VanylElement, v} from '/src/index.js'

export class AEl extends VanylElement{
	render(){
		return v`
		<vanyl-element></vanyl-element> <br>
		<vanyl-element></vanyl-element>
		`
	}
}
AEl.define('a-el')

export class BEl extends VanylElement {
	render(){
		return v`
			<a-el></a-el>
		`
	}
}
BEl.define('b-el')

let myComponent = document.createElement('b-el')
myComponent.onclick = e => console.log(myComponent)

document.body.appendChild(myComponent)