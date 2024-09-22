class Ion {
	out = true // out ? standalone textNode pin for element
			   //     : the element is the pin that the arg is used in
	init(el, arg) {
		// el = this.out ? text node to use as a pin instead of wbr
		//               : the element that the ion is put in
		// arg = the argument passed in the template function

		// called if this is the first time this kind of ion is passed 
		// in the place of the arg in the template function
	}
	update(el, arg) {
		// called in every update after the init call
	} 
	die(el, arg) {
		// called when another kind of ion is used. then the new ion's 
		// init is called and old one's die is called
	}
	diff(arg) {
		// when the same kind of ion is passed, this method determines 
		// whether we should treat it as a new one (die old and init new)
		// or we should call update instead. only a truthy return renews
	}
}
