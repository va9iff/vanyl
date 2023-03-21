export function prettyPropsInit(propsObj, element){
	for (const [key, val] of Object.entries(propsObj)) {
		const $key = key.slice(1)
		if (key[0] == "@") element.addEventListener($key, val)
		else if (key == "do") val(element)
		else if (val.vDirectiveInit?.(key, val, element, propsObj)) "just stop"
	}
}
export function prettyPropsUpdate(propsObj, element) {
	for (const [key, val] of Object.entries(propsObj)) {
		const $key = key.slice(1)
		if (val.vDirectiveUpdate?.(key, val, element)) "just stop"
		else if (key == "$do") val(element)
		else if (key[0] == ".")
			if (val) element.classList.add($key)
			else element.classList.remove($key)
		else element[key] = val
	}
}
