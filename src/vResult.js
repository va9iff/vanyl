export class VResult {
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
