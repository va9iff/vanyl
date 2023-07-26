/*	state is global across all the components. 
	local is for only the component.
	initial state of local defined as default parameter.
	they're proxies. 

	setting any property different value for state will update every component
	that used getter for the same property.

	setting any property different for local will update the component itself.
*/

// function MyFunComponent({ state }, local = { active: 0 }) {
function MyFunComponent(state, local = { active: 0 }) {
	return v`
		that's an ${text(state.data1)} test for ${text(5487)} so yeah
		and here's an input 
		<input type="text" 
		${{'?disabled': state.disabled}} 
		${{'attributes': state.value}}
		${{value: state.value}}>
		<button ${{'@click': ()=>alert()}}>alerts</button>
	`
}

define(MyFunComponent)



let MyComponent = ({ state }, local = { active: 0 }) => v`
	that's an ${text(state.data1)} test for ${text(5487)} so yeah
	and here's an input 
	<input type="text" 
	${{'?disabled': state.disabled}} 
	${{'attributes': state.value}}
	${{value: state.value}}>
	<button ${{'@click': ()=>alert()}}>alerts</button>
`


define(MyComponent)
