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
		this.element = element
		this.prop = key
		this.element[this.prop] = this.initialValue
		return true // don't treat it like normal a prop and don't assign it
	}
	vDirectiveUpdate(){
		return true
	}
}
