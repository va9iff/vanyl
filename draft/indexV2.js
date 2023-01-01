export const v = (strings, ...args) => ({ strings, args })

class Mark{
	constructor(payload){
		this.payload = payload
	}
	init(){
		let {payload} = this
	}

	static getDirective(){
		return (...payload) => ({payload:payload, cls: this})
	}
}


class Text extends Mark{
	constructor(){

	}
}

export const text = Text.getDirective()

class Sync{
	marks = []
	constructor(vFun, element){
		this.vFun = vFun
		this.element = element
		this.updateArgs()
		this.sync()
	}
	updateArgs(){
		this.vResult = this.vFun()
		this.strings = this.vResult.strings
		this.args = this.vResult.args
	}
	sync(){
		let {strings, args, element} = this
		let result = ""
		let stringLast = strings.at(-1)
		for (let [i, arg] of args.entries()) {
			let string = strings[i]
			this.marks[i] = new arg.cls(arg.payload)
		}
		console.log(this.marks)
	}
	update(){

	}
}

export function sync(vFun, el) {
	return new Sync(vFun, el)
}


// v`that's an ${212} test for ${[213,1312]} so yeah`
