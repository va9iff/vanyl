export class VError extends Error {
	name = "VanylError"
}
export class TypeVError extends TypeError {
	name = "VanylTypeError"
}


export const expect = {
	vResult(arg) {
		if (!(arg instanceof VResult))
			throw new TypeVError("expected vResult. \n instead use v`` function.")
	},
	sameVResult(vResult1, vResult2) {
		if (!vResult1.isSame(vResult2)) throw new VError("expected same vResult")
	},
	notNull(val) {
		if (val == null) throw new VError("not expected null")
	},
	oneChildElementCount(element) {
		if (element.childElementCount != 1)
			throw new VError(
				`expected 1 wrapped top element (got ${
					element.childElementCount
				}): \n${element.innerHTML.slice(0, 30)}...`
			)
	},
	notNullish(val) {
		if (val == null || val == undefined)
			throw new VError("not expected nullish")
	},
	instanceof(instance, cls) {
		if (!(instance instanceof cls))
			throw new TypeVError(`expected an instance of ${cls.name || cls}`)
	},
	vResultAt(arg, i) {
		if (!(arg instanceof VResult))
			throw new VError(`expected vResult for argument ${i} but got ${arg}`)
	},
}